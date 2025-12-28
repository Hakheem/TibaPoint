'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'  
import { revalidatePath } from 'next/cache'

// ✅ Package configurations with 30-day expiry
const PACKAGE_CONFIG = {
  Starter: {
    consultations: 5,
    credits: 10, // 5 * 2
    price: 10,
    // price: 2500,
    pricePerConsultation: 500,
    type: 'STARTER',
    expiryDays: 30
  },
  Family: {
    consultations: 8,
    credits: 16, // 8 * 2
    price: 3800,
    pricePerConsultation: 475,
    type: 'FAMILY',
    expiryDays: 30
  },
  Wellness: {
    consultations: 10,
    credits: 20, // 10 * 2
    price: 4500,
    pricePerConsultation: 450,
    type: 'WELLNESS',
    expiryDays: 30
  }
}

// ✅ USER'S BROWSER URLs (localhost for development)
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ✅ INTASEND SERVER URLs (MUST be public - ngrok URL)
const getWebhookBaseUrl = () => {
  if (process.env.WEBHOOK_URL) {
    // Remove any trailing paths
    let url = process.env.WEBHOOK_URL.trim()
    // Remove /api/webhooks/intasend if accidentally included
    url = url.replace(/\/api\/webhooks\/intasend$/, '')
    return url
  }
  // 2. In production, use the app URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'
  }
  
  // 3. Fallback with warning
  console.warn('⚠️ WEBHOOK_URL not set in .env! IntaSend cannot reach localhost')
  return 'http://localhost:3000'
}

const WEBHOOK_BASE_URL = getWebhookBaseUrl()

// Log configuration at server start
console.log('🌐 URL Configuration:', {
  userRedirects: BASE_URL,
  serverWebhooks: WEBHOOK_BASE_URL,
  isPublicUrl: !WEBHOOK_BASE_URL.includes('localhost'),
  webhookEndpoint: `${WEBHOOK_BASE_URL}/api/webhooks/intasend`
})

/**
 * Creates a checkout session with IntaSend SDK
 */
export async function createCheckoutSession(packageName) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    console.log('🔄 Starting checkout for user:', userId, 'package:', packageName)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const packageConfig = PACKAGE_CONFIG[packageName]
    if (!packageConfig) {
      return { success: false, error: 'Invalid package' }
    }

    // Dynamically import IntaSend SDK
    const IntaSend = (await import('intasend-node')).default
    
    console.log('🔑 Environment check:', {
      publishableKey: !!process.env.INTASEND_PUBLISHABLE_KEY,
      secretKey: !!process.env.INSTASEND_SECRET_KEY,
      webhookBaseUrl: WEBHOOK_BASE_URL
    })

    const intasend = new IntaSend(
      process.env.INTASEND_PUBLISHABLE_KEY,
      process.env.INSTASEND_SECRET_KEY,
      true  // true = test environment
    )

    const collection = intasend.collection()
    const apiRef = `PKG-${user.id}-${Date.now()}`

    // ✅ SEPARATE URLs for user vs IntaSend server
    const redirectUrl = `${BASE_URL}/payment/success?ref=${apiRef}`
    const callbackUrl = `${WEBHOOK_BASE_URL}/api/webhooks/intasend`

    console.log('💳 Creating IntaSend charge:', {
      user: user.email,
      amount: packageConfig.price,
      apiRef,
      userRedirect: redirectUrl,
      serverCallback: callbackUrl
    })

    const resp = await collection.charge({
      first_name: user.name?.split(' ')[0] || 'Customer',
      last_name: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone_number: user.phone || '254712345678', // REQUIRED for M-Pesa
      host: BASE_URL,
      amount: packageConfig.price,
      currency: 'KES',
      api_ref: apiRef,
      redirect_url: redirectUrl, // User's browser goes here after payment
      callback_url: callbackUrl, // ✅ IntaSend server calls this (PUBLIC URL)
      metadata: JSON.stringify({
        userId: user.id,
        packageName: packageName,
        packageType: packageConfig.type,
        credits: packageConfig.credits,
        consultations: packageConfig.consultations,
        expiryDays: 30
      })
    })

    console.log('✅ IntaSend response:', {
      url: resp.url ? 'Checkout URL generated' : 'No URL',
      invoice_id: resp.invoice_id || 'No invoice ID',
      callbackUrl: callbackUrl
    })
    
    if (!resp.url) {
      throw new Error('No checkout URL received from IntaSend')
    }

    // Store pending payment for webhook reference
    await prisma.systemConfig.upsert({
      where: { key: `pending_payment_${apiRef}` },
      update: {
        value: JSON.stringify({
          userId: user.id,
          packageName,
          packageConfig,
          intasendInvoiceId: resp.invoice_id,
          apiRef,
          callbackUrl: callbackUrl,
          createdAt: new Date().toISOString()
        })
      },
      create: {
        key: `pending_payment_${apiRef}`,
        value: JSON.stringify({
          userId: user.id,
          packageName,
          packageConfig,
          intasendInvoiceId: resp.invoice_id,
          apiRef,
          callbackUrl: callbackUrl,
          createdAt: new Date().toISOString()
        }),
        description: 'Pending IntaSend payment'
      }
    })

    return {
      success: true,
      url: resp.url,
      reference: apiRef
    }

  } catch (error) {
    console.error('❌ IntaSend checkout error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    
    return { 
      success: false, 
      error: error.message || 'Failed to create checkout' 
    }
  }
}

/**
 * Processes successful payment (called by webhook)
 */
export async function processSuccessfulPayment(paymentData) {
  try {
    const { invoice_id, api_ref, metadata } = paymentData
    
    if (!metadata) {
      throw new Error('No metadata in payment data')
    }

    const parsedMetadata = JSON.parse(metadata)
    const { userId, packageName, packageType, credits, consultations } = parsedMetadata

    if (!userId || !packageName) {
      throw new Error('Missing required payment data')
    }

    console.log('💰 Processing payment for:', { userId, packageName, api_ref })

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const packageConfig = PACKAGE_CONFIG[packageName]
    
    // Calculate expiry date (30 days from now)
    const purchaseDate = new Date()
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    // Start database transaction
    await prisma.$transaction(async (tx) => {
      // Create credit package with 30-day expiry
      const newPackage = await tx.creditPackage.create({
        data: {
          userId: user.id,
          packageType: packageType || packageConfig.type,
          consultations: consultations || packageConfig.consultations,
          totalCredits: credits || packageConfig.credits,
          creditsUsed: 0,
          creditsRemaining: credits || packageConfig.credits,
          priceKsh: packageConfig.price,
          pricePerConsultation: packageConfig.pricePerConsultation,
          purchasedAt: purchaseDate,
          validUntil: expiryDate,
          expiresAt: expiryDate,
          status: 'ACTIVE',
          isShareable: packageName !== 'Starter'
        }
      })

      // Update user credits
      await tx.user.update({
        where: { id: user.id },
        data: {
          credits: user.credits + (credits || packageConfig.credits)
        }
      })

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          packageId: newPackage.id,
          amount: credits || packageConfig.credits,
          type: 'PURCHASE',
          description: `Purchased ${packageName} package (${consultations || packageConfig.consultations} consultations) - Valid for 30 days`,
          balanceBefore: user.credits,
          balanceAfter: user.credits + (credits || packageConfig.credits)
        }
      })

      // Create success notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Payment Successful! 🎉',
          message: `Your ${packageName} package has been activated! You now have ${consultations || packageConfig.consultations} consultations valid for 30 days.`,
          isRead: false,
          relatedId: newPackage.id,
          actionUrl: '/dashboard'
        }
      })
    })

    // Clean up pending payment record
    await prisma.systemConfig.deleteMany({
      where: {
        key: `pending_payment_${api_ref}`
      }
    })

    revalidatePath('/pricing')
    revalidatePath('/dashboard')
    revalidatePath('/credits')
    
    console.log('✅ Payment processed successfully for:', api_ref)
    return { success: true }

  } catch (error) {
    console.error('❌ Payment processing error:', error)
    return { success: false, error: 'Failed to process payment' }
  }
}

/**
 * Gets user's current package and credit status
 */
export async function getUserPackageStatus() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        creditPackages: {
          where: { 
            status: 'ACTIVE',
            expiresAt: { gt: new Date() }
          },
          orderBy: { purchasedAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const activePackage = user.creditPackages[0] || null
    const consultationsAvailable = Math.floor(user.credits / 2)

    // Calculate days remaining
    let daysRemaining = 0
    if (activePackage && activePackage.expiresAt) {
      const now = new Date()
      const expiryDate = new Date(activePackage.expiresAt)
      daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
      daysRemaining = Math.max(0, daysRemaining)
    }

    return {
      success: true,
      data: {
        credits: user.credits,
        consultationsAvailable,
        activePackage: activePackage ? {
          type: activePackage.packageType,
          name: activePackage.packageType === 'STARTER' ? 'Starter' : 
                activePackage.packageType === 'FAMILY' ? 'Family' : 'Wellness',
          consultations: activePackage.consultations,
          consultationsUsed: activePackage.creditsUsed / 2,
          consultationsRemaining: activePackage.creditsRemaining / 2,
          validUntil: activePackage.validUntil,
          expiresAt: activePackage.expiresAt,
          daysRemaining: daysRemaining,
          pricePerConsultation: activePackage.pricePerConsultation
        } : null
      }
    }

  } catch (error) {
    console.error('❌ Get package status error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Cancels a pending payment
 */
export async function cancelPendingPayment(apiRef) {
  try {
    await prisma.systemConfig.deleteMany({
      where: {
        key: `pending_payment_${apiRef}`
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('❌ Cancel payment error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Test function to verify IntaSend connection
 */
export async function testIntaSendConnection() {
  try {
    const IntaSend = (await import('intasend-node')).default
    
    const intasend = new IntaSend(
      process.env.INTASEND_PUBLISHABLE_KEY,
      process.env.INSTASEND_SECRET_KEY,
      true
    )

    const collection = intasend.collection()
    const apiRef = `TEST-${Date.now()}`
    const callbackUrl = `${WEBHOOK_BASE_URL}/api/webhooks/intasend`

    console.log('🧪 Testing with callback URL:', callbackUrl)

    const resp = await collection.charge({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone_number: '254712345678',
      host: BASE_URL,
      amount: 10, // Small test amount
      currency: 'KES',
      api_ref: apiRef,
      redirect_url: `${BASE_URL}/test-success`,
      callback_url: callbackUrl,
      metadata: JSON.stringify({
        test: true,
        userId: 'test-user',
        packageName: 'Test',
        credits: 2,
        consultations: 1,
        expiryDays: 30
      })
    })

    return {
      success: true,
      url: resp.url,
      message: 'IntaSend connection working',
      callbackUrl: callbackUrl
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      callbackUrl: `${WEBHOOK_BASE_URL}/api/webhooks/intasend`
    }
  }
}

/**
 * Test webhook endpoint directly
 */
export async function testWebhookEndpoint() {
  const testUrl = `${WEBHOOK_BASE_URL}/api/webhooks/intasend`
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET'
    })
    
    const data = await response.json()
    
    return {
      success: response.ok,
      status: response.status,
      url: testUrl,
      data: data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: testUrl
    }
  }
}

