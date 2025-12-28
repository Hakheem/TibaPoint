// actions/appointments/credits.js
// Helper functions for handling credits during appointment booking

import { prisma } from '@/lib/db'

/**
 * Deducts credits for an appointment booking
 * Logic: Free credits (welcome bonus) are used first, then package credits
 */
export async function deductCreditsForAppointment(userId, appointmentId) {
  const CREDITS_PER_CONSULTATION = 2

  return await prisma.$transaction(async (tx) => {
    // Get user with their active package
    const user = await tx.user.findUnique({ 
      where: { id: userId }, 
      include: {
        creditPackages: {
          where: { status: 'ACTIVE' },
          orderBy: { purchasedAt: 'desc' },
          take: 1
        },
        creditTransactions: {
          where: { type: 'WELCOME_BONUS' },
          take: 1
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.credits < CREDITS_PER_CONSULTATION) {
      throw new Error('Insufficient credits')
    }

    const activePackage = user.creditPackages[0]
    const hasWelcomeBonus = user.creditTransactions.length > 0

    let pricePerConsultation = 500 // Default
    let transactionDescription = ''
    let useWelcomeBonus = false

    // Determine if this uses welcome bonus or package credits
    if (!hasWelcomeBonus && user.credits === 2) {
      // This is the free consultation
      useWelcomeBonus = true
      transactionDescription = 'Welcome bonus consultation (FREE)'
    } else if (!hasWelcomeBonus && user.credits > 2) {
      // User has package + free credits, use free first
      useWelcomeBonus = true
      transactionDescription = 'Welcome bonus consultation (FREE)'
    } else if (activePackage) {
      // Use package credits
      pricePerConsultation = activePackage.pricePerConsultation
      transactionDescription = `${activePackage.packageType} package consultation`
    } else {
      throw new Error('No active package found')
    }

    // Deduct credits from user
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: CREDITS_PER_CONSULTATION
        }
      }
    })

    // Update package if using package credits
    if (activePackage && !useWelcomeBonus) {
      await tx.creditPackage.update({
        where: { id: activePackage.id },
        data: {
          creditsUsed: {
            increment: CREDITS_PER_CONSULTATION
          },
          creditsRemaining: {
            decrement: CREDITS_PER_CONSULTATION
          }
        }
      })
    }

    // Create transaction record
    const transaction = await tx.creditTransaction.create({
      data: {
        userId: user.id,
        packageId: useWelcomeBonus ? null : activePackage?.id,
        amount: -CREDITS_PER_CONSULTATION,
        type: useWelcomeBonus ? 'WELCOME_BONUS' : 'SPENT',
        description: transactionDescription,
        balanceBefore: user.credits,
        balanceAfter: user.credits - CREDITS_PER_CONSULTATION,
        appointmentId: appointmentId
      }
    })

    // Calculate earnings split (only for paid consultations)
    const platformCommission = useWelcomeBonus ? 0 : 0.12 // 12%
    const platformEarnings = useWelcomeBonus ? 0 : pricePerConsultation * platformCommission
    const doctorEarnings = useWelcomeBonus ? 0 : pricePerConsultation * (1 - platformCommission)

    return {
      success: true,
      creditsDeducted: CREDITS_PER_CONSULTATION,
      pricePerConsultation,
      platformEarnings,
      doctorEarnings,
      usedWelcomeBonus: useWelcomeBonus,
      transactionId: transaction.id
    }
  })
}

/**
 * Refunds credits for a cancelled appointment
 */
export async function refundCreditsForAppointment(userId, appointmentId, refundPercentage = 100) {
  const CREDITS_PER_CONSULTATION = 2

  return await prisma.$transaction(async (tx) => {
    // Get the original appointment
    const appointment = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: {
            creditPackages: {
              where: { status: 'ACTIVE' },
              orderBy: { purchasedAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!appointment) {
      throw new Error('Appointment not found')
    }

    // Calculate refund amount
    const creditsToRefund = Math.floor((CREDITS_PER_CONSULTATION * refundPercentage) / 100)
    
    if (creditsToRefund === 0) {
      return { success: true, creditsRefunded: 0 }
    }

    const activePackage = appointment.patient.creditPackages[0]

    // Refund credits to user
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: creditsToRefund
        }
      }
    })

    // Update package if applicable
    if (activePackage) {
      await tx.creditPackage.update({
        where: { id: activePackage.id },
        data: {
          creditsUsed: {
            decrement: creditsToRefund
          },
          creditsRemaining: {
            increment: creditsToRefund
          }
        }
      })

      // Create refund transaction
      await tx.creditTransaction.create({
        data: {
          userId: userId,
          packageId: activePackage.id,
          amount: creditsToRefund,
          type: 'REFUND',
          description: `Refund for cancelled appointment (${refundPercentage}%)`,
          balanceBefore: appointment.patient.credits,
          balanceAfter: appointment.patient.credits + creditsToRefund,
          appointmentId: appointmentId
        }
      })
    }

    // Update appointment
    await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        creditsRefunded: creditsToRefund
      }
    })

    // Notify user
    await tx.notification.create({
      data: {
        userId: userId,
        type: 'REFUND',
        title: 'Credits Refunded',
        message: `You've been refunded ${creditsToRefund / 2} consultation${creditsToRefund / 2 !== 1 ? 's' : ''} (${refundPercentage}% refund) for your cancelled appointment.`,
        isRead: false,
        relatedId: appointmentId
      }
    })

    return {
      success: true,
      creditsRefunded: creditsToRefund,
      consultationsRefunded: creditsToRefund / 2
    }
  })
}

/**
 * Checks if user has sufficient credits for booking
 */
export async function checkCreditsAvailable(userId) {
  const CREDITS_PER_CONSULTATION = 2

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      creditPackages: {
        where: { status: 'ACTIVE' },
        orderBy: { purchasedAt: 'desc' },
        take: 1
      }
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const consultationsAvailable = Math.floor(user.credits / CREDITS_PER_CONSULTATION)
  const activePackage = user.creditPackages[0] || null

  return {
    hasCredits: user.credits >= CREDITS_PER_CONSULTATION,
    credits: user.credits,
    consultationsAvailable,
    activePackage: activePackage ? {
      type: activePackage.packageType,
      consultations: activePackage.consultations,
      consultationsRemaining: activePackage.creditsRemaining / 2,
      validUntil: activePackage.validUntil,
      pricePerConsultation: activePackage.pricePerConsultation
    } : null
  }
}

/**
 * Gets credit usage history for a user
 */
export async function getCreditHistory(userId, limit = 20) {
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      package: true
    }
  })

  return transactions.map(tx => ({
    id: tx.id,
    amount: tx.amount / 2, // Convert to consultations
    type: tx.type,
    description: tx.description,
    date: tx.createdAt,
    packageType: tx.package?.packageType || null
  }))
}

