'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'  
import { revalidatePath } from 'next/cache'

// Package confi - 30-day expiry
const PACKAGE_CONFIG = {
  Starter: {
    consultations: 5,
    credits: 10, 
    price: 2500, 
    pricePerConsultation: 500,
    type: 'STARTER',
    expiryDays: 30
  },
  Family: {
    consultations: 8,
    credits: 16,
    price: 3800,
    pricePerConsultation: 475,
    type: 'FAMILY',
    expiryDays: 30
  },
  Wellness: {
    consultations: 10,
    credits: 20,
    price: 4500,
    pricePerConsultation: 450,
    type: 'WELLNESS',
    expiryDays: 30
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// get stored payment data
async function findStoredPaymentData(api_ref) {
  try {
    const pendingPayment = await prisma.systemConfig.findUnique({
      where: { key: `pending_payment_${api_ref}` }
    })
    
    if (pendingPayment) {
      const data = JSON.parse(pendingPayment.value)
      console.log('✅ Found stored payment data:', {
        userId: data.userId,
        packageName: data.packageName,
        packageConfig: data.packageConfig
      })
      return data
    }
    return null
  } catch (error) {
    console.error('Error finding stored payment:', error)
    return null
  }
}

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

    const IntaSend = (await import('intasend-node')).default
    
    const intasend = new IntaSend(
      process.env.INTASEND_PUBLISHABLE_KEY,
      process.env.INSTASEND_SECRET_KEY,
      true
    )

    const collection = intasend.collection()
    const apiRef = `PKG-${user.id}-${Date.now()}`

    console.log('💳 Creating IntaSend charge:', {
      user: user.email,
      amount: packageConfig.price,
      apiRef
    })

    const webhookUrl = `${BASE_URL}/api/webhooks/intasend`

    const resp = await collection.charge({
      first_name: user.name?.split(' ')[0] || 'Patient',
      last_name: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone_number: user.phone || '254700000000',
      host: BASE_URL,
      amount: packageConfig.price,
      currency: 'KES',
      api_ref: apiRef,
      redirect_url: `${BASE_URL}/payment/success?ref=${apiRef}`,
      callback_url: webhookUrl,
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
      invoice_id: resp.invoice_id || 'No invoice ID'
    })
    
    if (!resp.url) {
      throw new Error('No checkout URL received from IntaSend')
    }

    // Store pending payment 
    await prisma.systemConfig.upsert({
      where: { key: `pending_payment_${apiRef}` },
      update: {
        value: JSON.stringify({
          userId: user.id,
          packageName,
          packageConfig: {
            consultations: packageConfig.consultations,
            credits: packageConfig.credits,
            price: packageConfig.price,
            pricePerConsultation: packageConfig.pricePerConsultation,
            type: packageConfig.type,
            expiryDays: 30
          },
          apiRef,
          createdAt: new Date().toISOString()
        })
      },
      create: {
        key: `pending_payment_${apiRef}`,
        value: JSON.stringify({
          userId: user.id,
          packageName,
          packageConfig: {
            consultations: packageConfig.consultations,
            credits: packageConfig.credits,
            price: packageConfig.price,
            pricePerConsultation: packageConfig.pricePerConsultation,
            type: packageConfig.type,
            expiryDays: 30
          },
          apiRef,
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
    console.error('❌ IntaSend checkout error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Processes successful payment (called by webhook)
 */
export async function processSuccessfulPayment(paymentData) {
  try {
    const { invoice_id, api_ref, metadata } = paymentData
    
    console.log('💰 Processing payment for api_ref:', api_ref)
    
    let userId, packageName, packageConfigData
    
    // get data from metadata first
    if (metadata) {
      try {
        const parsed = JSON.parse(metadata)
        userId = parsed.userId
        packageName = parsed.packageName
        console.log('✅ Got data from metadata:', { userId, packageName })
      } catch (e) {
        console.log('⚠️ Could not parse metadata:', e.message)
      }
    }
    
    // If no metadata, find stored data
    if (!userId || !packageName) {
      console.log('🔍 Looking for stored payment data...')
      const storedData = await findStoredPaymentData(api_ref)
      
      if (storedData) {
        userId = storedData.userId
        packageName = storedData.packageName
        packageConfigData = storedData.packageConfig
        console.log('✅ Got data from stored payment:', { userId, packageName })
      } else {
        throw new Error(`No payment data found for api_ref: ${api_ref}`)
      }
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get package config
    const packageConfig = packageConfigData || PACKAGE_CONFIG[packageName]
    
    if (!packageConfig) {
      throw new Error(`Package config not found for: ${packageName}`)
    }

    console.log('📦 Package config:', packageConfig)
    
    // Calculate expiry date (30 days from now)
    const purchaseDate = new Date()
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    console.log('💾 Starting database transaction...')
    
    // Start database transaction
    await prisma.$transaction(async (tx) => {
      // Create credit package 
      const newPackage = await tx.creditPackage.create({
        data: {
          userId: user.id,
          packageType: packageConfig.type,
          consultations: packageConfig.consultations,
          totalCredits: packageConfig.credits,
          creditsUsed: 0,
          creditsRemaining: packageConfig.credits,
          priceKsh: packageConfig.price,
          pricePerConsultation: packageConfig.pricePerConsultation,
          purchasedAt: purchaseDate,
          validUntil: expiryDate,
          expiresAt: expiryDate,
          status: 'ACTIVE',
          isShareable: packageName !== 'Starter'
        }
      })

      console.log('✅ Created credit package:', newPackage.id)

      // Update user credits
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: user.credits + packageConfig.credits
        }
      })

      console.log('✅ Updated user credits:', {
        before: user.credits,
        after: updatedUser.credits,
        added: packageConfig.credits
      })

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          packageId: newPackage.id,
          amount: packageConfig.credits,
          type: 'PURCHASE',
          description: `Purchased ${packageName} package (${packageConfig.consultations} consultations) - Valid for 30 days`,
          balanceBefore: user.credits,
          balanceAfter: user.credits + packageConfig.credits
        }
      })

      console.log('✅ Created transaction record')

      // Create success notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Payment Successful 🎉',
          message: `Your ${packageName} package has been activated! You now have ${packageConfig.consultations} consultations valid for 30 days.`,
          isRead: false,
          relatedId: newPackage.id,
          actionUrl: '/dashboard'
        }
      })

      console.log('✅ Created notification')
    })

    // Clean up pending payment record
    await prisma.systemConfig.deleteMany({
      where: {
        key: `pending_payment_${api_ref}`
      }
    })

    console.log('✅ Cleaned up pending payment')

    revalidatePath('/', 'layout')
    revalidatePath('/pricing')
    revalidatePath('/dashboard')
    revalidatePath('/credits')
    revalidatePath('/admin')
    
    console.log('✅ Payment processed successfully for:', api_ref)
    return { success: true }

  } catch (error) {
    console.error('❌ Payment processing error:', error)
    return { success: false, error: error.message }
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

