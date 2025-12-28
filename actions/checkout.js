// actions/checkout.js
'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// CREDIT ALLOCATION PER PLAN - 2 credits per consultation
const CREDIT_PLANS = {
  'cplan_37OfYWVXIvH048yffRE341VKwrh': { // Starter
    name: 'STARTER',
    consultations: 5,
    credits: 10, // 5 * 2
    priceKsh: 2500,
    pricePerConsultation: 500,
    isShareable: false
  },
  'cplan_37OgBmF9FuqqKKqzDGY2UkGLS3A': { // Family
    name: 'FAMILY',
    consultations: 8,
    credits: 16, // 8 * 2
    priceKsh: 3800,
    pricePerConsultation: 475,
    isShareable: true
  },
  'cplan_37OgM5CvUFRP026C4Lm69U0kaqd': { // Wellness
    name: 'WELLNESS',
    consultations: 10,
    credits: 20, // 10 * 2
    priceKsh: 4500,
    pricePerConsultation: 450,
    isShareable: true
  }
}

export async function createCheckoutSession(planId, packageName) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { 
        success: false, 
        error: 'Not authenticated' 
      }
    }

    // Validate plan exists
    if (!CREDIT_PLANS[planId]) {
      return { 
        success: false, 
        error: 'Invalid plan selected' 
      }
    }

    // Get Clerk instance ID
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    if (!publishableKey) {
      return { 
        success: false, 
        error: 'Clerk configuration error' 
      }
    }

    const instanceId = publishableKey.replace('pk_', '').split('_')[0]
    
    // Create checkout URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const checkoutUrl = `https://${instanceId}.clerk.accounts.dev/subscriptions/checkout` +
      `?plan_id=${planId}` +
      `&success_url=${encodeURIComponent(`${baseUrl}/credits?success=true&plan=${planId}`)}` +
      `&cancel_url=${encodeURIComponent(`${baseUrl}/pricing?canceled=true`)}`
    
    return { 
      success: true, 
      url: checkoutUrl
    }
  } catch (error) {
    console.error('Checkout session error:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to create checkout session' 
    }
  }
}

// Call this function from your success page or existing webhook
export async function allocateCreditsAfterPayment(clerkUserId, planId) {
  try {
    const plan = CREDIT_PLANS[planId]
    
    if (!plan) {
      throw new Error('Invalid plan ID')
    }

    // Get user from DB
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Check if this exact purchase was already processed
    const existingPackage = await db.creditPackage.findFirst({
      where: {
        userId: user.id,
        packageType: plan.name,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Within last 5 minutes
        }
      }
    })

    if (existingPackage) {
      console.log('Credits already allocated for this purchase')
      return {
        success: true,
        alreadyProcessed: true,
        credits: user.credits
      }
    }

    // Calculate expiry (1 year as per your pricing description)
    const validUntil = new Date()
    validUntil.setFullYear(validUntil.getFullYear() + 1)

    // Allocate credits in transaction
    const result = await db.$transaction(async (tx) => {
      // Get current user credits first
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { credits: true }
      })

      const currentCredits = currentUser.credits || 0

      // Create credit package
      const creditPackage = await tx.creditPackage.create({
        data: {
          userId: user.id,
          packageType: plan.name,
          consultations: plan.consultations,
          totalCredits: plan.credits,
          creditsUsed: 0,
          creditsRemaining: plan.credits,
          priceKsh: plan.priceKsh,
          pricePerConsultation: plan.pricePerConsultation,
          purchasedAt: new Date(),
          validUntil: validUntil,
          expiresAt: validUntil,
          status: 'ACTIVE',
          isShareable: plan.isShareable
        }
      })

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          packageId: creditPackage.id,
          amount: plan.credits,
          type: 'PURCHASE',
          description: `${plan.name} package - ${plan.consultations} consultations`,
          balanceBefore: currentCredits,
          balanceAfter: currentCredits + plan.credits
        }
      })

      // UPDATE USER CREDITS - INCREMENT, NOT REPLACE
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            increment: plan.credits // THIS IS THE KEY - ADDS TO EXISTING
          }
        }
      })

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: `${plan.name} Package Activated! 🎉`,
          message: `${plan.consultations} consultations added to your account. You now have ${Math.floor((currentCredits + plan.credits) / 2)} total consultations available.`,
          relatedId: creditPackage.id
        }
      })

      return { creditPackage, updatedUser }
    })

    // Revalidate pages
    revalidatePath('/credits')
    revalidatePath('/appointments')
    revalidatePath('/dashboard')

    return { 
      success: true, 
      credits: result.updatedUser.credits,
      consultations: Math.floor(result.updatedUser.credits / 2),
      package: result.creditPackage 
    }

  } catch (error) {
    console.error('Credit allocation error:', error)
    throw error
  }
}

