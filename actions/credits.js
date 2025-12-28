// actions/credits.js
'use server'

import { auth } from '@clerk/nextjs/server'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// CREDIT ALLOCATION PER PLAN - 2 credits per consultation
const CREDIT_PLAN = {
    Starter: 10,    // 5 consultations * 2
    Family: 16,     // 8 consultations * 2
    Wellness: 20    // 10 consultations * 2 
}

export async function checkAndAllocateCredits(user) {
   try {
        if (!user) {
            return null
        }

        if (user.role !== 'PATIENT') {
            return user
        }

        const session = await auth()
        
        // Check Clerk subscription - using metadata approach
        const metadata = session.userPublicMetadata || {}
        
        let currentPlan = null
        let creditsToAllocate = 0

        if (metadata.subscription === 'wellness') {
            currentPlan = "WELLNESS"
            creditsToAllocate = CREDIT_PLAN.Wellness
        } else if (metadata.subscription === 'family') {
            currentPlan = "FAMILY"
            creditsToAllocate = CREDIT_PLAN.Family
        } else if (metadata.subscription === 'starter') {
            currentPlan = "STARTER"
            creditsToAllocate = CREDIT_PLAN.Starter
        }

        // If no active plan found
        if (!currentPlan) {
            return user
        }

        const currentMonth = format(new Date(), 'yyyy-MM')
        
        // Check if credits were already allocated this month
        const recentTransactions = await db.creditTransaction.findMany({
            where: {
                userId: user.id,
                type: 'PURCHASE',
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 1
        })

        if (recentTransactions.length > 0) {
            const latestTransaction = recentTransactions[0]
            const transactionMonth = format(new Date(latestTransaction.createdAt), 'yyyy-MM')
            
            if (transactionMonth === currentMonth) {
                return user // Already allocated this month
            }
        }

        // Create package configuration based on plan
        const packageConfigs = {
            'STARTER': {
                consultations: 5,
                priceKsh: 2500,
                pricePerConsultation: 500,
                isShareable: false
            },
            'FAMILY': {
                consultations: 8,
                priceKsh: 3800,
                pricePerConsultation: 475,
                isShareable: true
            },
            'WELLNESS': {
                consultations: 10,
                priceKsh: 4500,
                pricePerConsultation: 450,
                isShareable: true
            }
        }

        const config = packageConfigs[currentPlan]

        // Allocate credits
        const updatedUser = await db.$transaction(async (tx) => {
            // Create credit package
            const creditPackage = await tx.creditPackage.create({
                data: {
                    userId: user.id,
                    packageType: currentPlan,
                    consultations: config.consultations,
                    totalCredits: creditsToAllocate,
                    creditsUsed: 0,
                    creditsRemaining: creditsToAllocate,
                    priceKsh: config.priceKsh,
                    pricePerConsultation: config.pricePerConsultation,
                    purchasedAt: new Date(),
                    validUntil: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days
                    expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)),
                    status: 'ACTIVE',
                    isShareable: config.isShareable
                }
            })

            // Create transaction record
            await tx.creditTransaction.create({
                data: {
                    userId: user.id,
                    packageId: creditPackage.id,
                    amount: creditsToAllocate,
                    type: 'PURCHASE',
                    description: `Monthly ${currentPlan.toLowerCase()} package allocation`,
                    balanceBefore: user.credits,
                    balanceAfter: user.credits + creditsToAllocate
                }
            })

            // Update user credits
            const updatedUser = await tx.user.update({
                where: {
                    id: user.id
                },
                data: {
                    credits: {
                        increment: creditsToAllocate
                    }
                }
            })

            // Create notification
            await tx.notification.create({
                data: {
                    userId: user.id,
                    type: 'SYSTEM',
                    title: `Credits Added!`,
                    message: `Your ${currentPlan.toLowerCase()} package has been activated. ${config.consultations} consultations added to your account.`,
                    relatedId: creditPackage.id
                }
            })

            return updatedUser
        })

        // Revalidate paths
        revalidatePath('/dashboard')
        revalidatePath('/appointments')
        revalidatePath('/credits')

        return updatedUser

   } catch (error) {
        console.error('Failed to check subscription and allocate credits:', error.message)
        return user
   }
}
