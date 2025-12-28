import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { processSuccessfulPayment } from '@/actions/checkout'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const INSTASEND_WEBHOOK_SECRET = process.env.INSTASEND_WEBHOOK_SECRET

/**
 * Verifies InstaSend webhook signature
 */
function verifyWebhookSignature(payload, signature) {
  if (!INSTASEND_WEBHOOK_SECRET) {
    console.warn('INSTASEND_WEBHOOK_SECRET not configured')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', INSTASEND_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Handles InstaSend webhook events
 */
export async function POST(req) {
  try {
    const body = await req.text()
    const headersList = headers()
    const signature = headersList.get('x-instasend-signature') || ''

    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    console.log('InstaSend webhook received:', event)

    switch (event.state || event.status) {
      case 'COMPLETE':
      case 'COMPLETED':
      case 'SUCCESS':
        await handleSuccessfulPayment(event)
        break

      case 'FAILED':
      case 'REJECTED':
        await handleFailedPayment(event)
        break

      case 'PENDING':
        await handlePendingPayment(event)
        break

      default:
        console.log('Unhandled webhook event state:', event.state)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handles successful payment completion
 */
async function handleSuccessfulPayment(event) {
  try {
    const { api_ref, invoice_id } = event

    const pendingPayment = await prisma.systemConfig.findUnique({
      where: { key: `pending_payment_${api_ref}` }
    })

    if (!pendingPayment) {
      console.error('Pending payment not found:', api_ref)
      return
    }

    const paymentData = JSON.parse(pendingPayment.value)

    const result = await processSuccessfulPayment({
      api_ref,
      invoice_id,
      metadata: {
        userId: paymentData.userId,
        packageName: paymentData.packageName,
        packageType: paymentData.packageConfig.type,
        isUpgrade: paymentData.isUpgrade,
        oldPackageId: paymentData.oldPackageId
      }
    })

    if (!result?.success) {
      throw new Error('Failed to process payment')
    }

    console.log('Payment processed successfully:', api_ref)
  } catch (error) {
    console.error('Error handling successful payment:', error)

    await createAdminNotification({
      title: 'Payment Processing Error',
      message: `Failed to process payment ${event.api_ref}. Manual review required.`,
      metadata: event
    })
  }
}

/**
 * Handles failed payment
 */
async function handleFailedPayment(event) {
  try {
    const { api_ref, failed_reason } = event

    const pendingPayment = await prisma.systemConfig.findUnique({
      where: { key: `pending_payment_${api_ref}` }
    })

    if (!pendingPayment) {
      console.error('Pending payment not found:', api_ref)
      return
    }

    const paymentData = JSON.parse(pendingPayment.value)

    await prisma.notification.create({
      data: {
        userId: paymentData.userId,
        type: 'SYSTEM',
        title: 'Payment Failed',
        message: `Your payment for the ${paymentData.packageName} package failed. Reason: ${failed_reason || 'Unknown'}. Please try again.`,
        isRead: false
      }
    })

    await prisma.systemConfig.delete({
      where: { key: `pending_payment_${api_ref}` }
    })

    console.log('Failed payment handled:', api_ref)
  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}

/**
 * Handles pending payment status
 */
async function handlePendingPayment(event) {
  console.log('Payment pending:', event.api_ref)
}

/**
 * Creates notification for admin review
 */
async function createAdminNotification(data) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    })

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'SYSTEM',
          title: data.title,
          message: data.message,
          isRead: false
        }
      })
    }

    await prisma.adminLog.create({
      data: {
        adminId: 'SYSTEM',
        action: 'payment_processing_error',
        targetType: 'payment',
        targetId: data.metadata?.api_ref || 'unknown',
        reason: data.message,
        metadata: data.metadata
      }
    })
  } catch (error) {
    console.error('Error creating admin notification:', error)
  }
}

/**
 * Handle GET requests (health check)
 */
export async function GET() {
  return NextResponse.json(
    { message: 'InstaSend webhook endpoint is active' },
    { status: 200 }
  )
}


