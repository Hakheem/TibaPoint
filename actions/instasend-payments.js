'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// InstaSend API configuration
const INSTASEND_API_URL = 'https://api.instasend.io/v1'
const INSTASEND_API_KEY = process.env.INSTASEND_API_KEY
const INSTASEND_API_TOKEN = process.env.INSTASEND_API_TOKEN
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Package configurations
const PACKAGE_CONFIG = {
  Starter: {
    consultations: 5,
    credits: 10, // 5 * 2
    price: 2500,
    pricePerConsultation: 500,
    type: 'STARTER'
  },
  Family: {
    consultations: 8,
    credits: 16, // 8 * 2
    price: 3800,
    pricePerConsultation: 475,
    type: 'FAMILY'
  },
  Wellness: {
    consultations: 10,
    credits: 20, // 10 * 2
    price: 4500,
    pricePerConsultation: 450,
    type: 'WELLNESS'
  }
}

/**
 * Creates a checkout session with InstaSend
 */
export async function createCheckoutSession(packageName) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        creditPackages: {
          where: { status: 'ACTIVE' },
          orderBy: { purchasedAt: 'desc' }
        }
      }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Get package configuration
    const packageConfig = PACKAGE_CONFIG[packageName]
    if (!packageConfig) {
      return { success: false, error: 'Invalid package' }
    }

    // Check for upgrade eligibility
    const upgradeResult = await checkUpgradeEligibility(user, packageConfig)
    
    let finalAmount = packageConfig.price
    let isUpgrade = false
    
    if (upgradeResult.canUpgrade && upgradeResult.amountToPay < packageConfig.price) {
      finalAmount = upgradeResult.amountToPay
      isUpgrade = true
    }

    // Create unique reference
    const apiRef = `PKG-${user.id}-${Date.now()}`

    // Create payment request with InstaSend
    const paymentData = {
      amount: finalAmount,
      email: user.email,
      phone_number: user.phone || '',
      first_name: user.name.split(' ')[0] || user.name,
      last_name: user.name.split(' ').slice(1).join(' ') || '',
      currency: 'KES',
      api_ref: apiRef,
      callback_url: `${BASE_URL}/api/webhooks/instasend`,
      redirect_url: `${BASE_URL}/payment/success?ref=${apiRef}`,
      failed_redirect_url: `${BASE_URL}/payment/failed`,
      metadata: {
        userId: user.id,
        packageName: packageName,
        packageType: packageConfig.type,
        isUpgrade: isUpgrade,
        oldPackageId: upgradeResult.currentPackage?.id || null
      }
    }

    const response = await fetch(`${INSTASEND_API_URL}/payment-requests/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INSTASEND_API_TOKEN}`,
        'X-API-KEY': INSTASEND_API_KEY
      },
      body: JSON.stringify(paymentData)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('InstaSend API Error:', error)
      return { success: false, error: 'Failed to create payment session' }
    }

    const paymentResponse = await response.json()

    // Store pending payment in database (optional - for tracking)
    await prisma.systemConfig.create({
      data: {
        key: `pending_payment_${paymentResponse.api_ref}`,
        value: JSON.stringify({
          userId: user.id,
          packageName,
          packageConfig,
          isUpgrade,
          amount: finalAmount,
          instasendId: paymentResponse.id,
          invoiceId: paymentResponse.invoice_id,
          createdAt: new Date().toISOString()
        }),
        description: 'Pending payment tracking'
      }
    })

    return {
      success: true,
      url: paymentResponse.payment_link,
      reference: paymentResponse.api_ref
    }

  } catch (error) {
    console.error('Checkout session error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Checks if user can upgrade to a higher tier package
 */
async function checkUpgradeEligibility(user, targetPackage) {
  const activePackage = user.creditPackages[0]
  
  if (!activePackage) {
    return {
      canUpgrade: false,
      currentPackage: null,
      amountToPay: targetPackage.price
    }
  }

  // If user has used any credits, they cannot upgrade (must purchase full package)
  if (activePackage.creditsUsed > 0) {
    return {
      canUpgrade: false,
      currentPackage: activePackage,
      amountToPay: targetPackage.price
    }
  }

  // Check if target package is higher tier
  const packageTiers = {
    STARTER: 1,
    FAMILY: 2,
    WELLNESS: 3
  }

  const currentTier = packageTiers[activePackage.packageType]
  const targetTier = packageTiers[targetPackage.type]

  if (targetTier <= currentTier) {
    return {
      canUpgrade: false,
      currentPackage: activePackage,
      amountToPay: targetPackage.price
    }
  }

  // Calculate upgrade amount (pay the difference)
  const amountPaid = activePackage.priceKsh
  const amountToPay = Math.max(0, targetPackage.price - amountPaid)

  return {
    canUpgrade: true,
    currentPackage: activePackage,
    amountToPay
  }
}

/**
 * Processes successful payment (called by webhook)
 */
export async function processSuccessfulPayment(paymentData) {
  try {
    const { api_ref, metadata } = paymentData
    const { userId, packageName, packageType, isUpgrade, oldPackageId } = metadata

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creditPackages: {
          where: { id: oldPackageId || '' }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const packageConfig = PACKAGE_CONFIG[packageName]

    // Start transaction
    await prisma.$transaction(async (tx) => {
      if (isUpgrade && oldPackageId) {
        // Upgrade: Expire old package and create new one with remaining credits
        const oldPackage = user.creditPackages[0]
        
        if (oldPackage) {
          // Expire old package
          await tx.creditPackage.update({
            where: { id: oldPackageId },
            data: { status: 'EXPIRED' }
          })

          // Create new package with combined credits
          const remainingCredits = oldPackage.creditsRemaining
          const newTotalCredits = packageConfig.credits + remainingCredits

          const newPackage = await tx.creditPackage.create({
            data: {
              userId: user.id,
              packageType: packageConfig.type,
              consultations: packageConfig.consultations + (remainingCredits / 2),
              totalCredits: newTotalCredits,
              creditsUsed: 0,
              creditsRemaining: newTotalCredits,
              priceKsh: packageConfig.price,
              pricePerConsultation: packageConfig.pricePerConsultation,
              purchasedAt: new Date(),
              validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              status: 'ACTIVE',
              isShareable: packageName !== 'Starter'
            }
          })

          // Update user credits
          await tx.user.update({
            where: { id: user.id },
            data: {
              credits: user.credits + packageConfig.credits
            }
          })

          // Create transaction record
          await tx.creditTransaction.create({
            data: {
              userId: user.id,
              packageId: newPackage.id,
              amount: packageConfig.credits,
              type: 'PURCHASE',
              description: `Upgraded to ${packageName} package (${packageConfig.consultations} consultations)`,
              balanceBefore: user.credits,
              balanceAfter: user.credits + packageConfig.credits
            }
          })
        }
      } else {
        // New purchase: Create package and add credits
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
            purchasedAt: new Date(),
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
            isShareable: packageName !== 'Starter'
          }
        })

        // Update user credits
        await tx.user.update({
          where: { id: user.id },
          data: {
            credits: user.credits + packageConfig.credits
          }
        })

        // Create transaction record
        await tx.creditTransaction.create({
          data: {
            userId: user.id,
            packageId: newPackage.id,
            amount: packageConfig.credits,
            type: 'PURCHASE',
            description: `Purchased ${packageName} package (${packageConfig.consultations} consultations)`,
            balanceBefore: user.credits,
            balanceAfter: user.credits + packageConfig.credits
          }
        })
      }

      // Create success notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Payment Successful',
          message: `Your ${packageName} package has been activated. You now have access to ${packageConfig.consultations} consultations.`,
          isRead: false
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
    
    return { success: true }

  } catch (error) {
    console.error('Payment processing error:', error)
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
          where: { status: 'ACTIVE' },
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

    return {
      success: true,
      data: {
        credits: user.credits,
        consultationsAvailable,
        activePackage: activePackage ? {
          type: activePackage.packageType,
          consultations: activePackage.consultations,
          consultationsUsed: activePackage.creditsUsed / 2,
          consultationsRemaining: activePackage.creditsRemaining / 2,
          validUntil: activePackage.validUntil,
          pricePerConsultation: activePackage.pricePerConsultation
        } : null
      }
    }

  } catch (error) {
    console.error('Get package status error:', error)
    return { success: false, error: 'Internal server error' }
  }
}
