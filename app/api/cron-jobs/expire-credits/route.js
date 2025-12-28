import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key'

// Prisma enum values (JS-safe)
const PackageStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED'
}

const TransactionType = {
  EXPIRY: 'EXPIRY'
}

const NotificationType = {
  CREDIT_EXPIRY: 'CREDIT_EXPIRY'
}

export async function GET(req) {
  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    // Find expired packages
    const expiredPackages = await prisma.creditPackage.findMany({
      where: {
        status: PackageStatus.ACTIVE,
        expiresAt: { lte: now }
      },
      include: { user: true }
    })

    let expiredCount = 0
    let creditsExpired = 0

    for (const pkg of expiredPackages) {
      await prisma.$transaction(async (tx) => {
        await tx.creditPackage.update({
          where: { id: pkg.id },
          data: { status: PackageStatus.EXPIRED }
        })

        const creditsToDeduct = pkg.creditsRemaining

        await tx.user.update({
          where: { id: pkg.userId },
          data: {
            credits: { decrement: creditsToDeduct }
          }
        })

        await tx.creditTransaction.create({
          data: {
            userId: pkg.userId,
            packageId: pkg.id,
            amount: -creditsToDeduct,
            type: TransactionType.EXPIRY,
            description: `${pkg.packageType} package expired. ${creditsToDeduct / 2} consultation${creditsToDeduct / 2 !== 1 ? 's' : ''} unused.`,
            balanceBefore: pkg.user.credits,
            balanceAfter: pkg.user.credits - creditsToDeduct
          }
        })

        await tx.notification.create({
          data: {
            userId: pkg.userId,
            type: NotificationType.CREDIT_EXPIRY,
            title: 'Package Expired',
            message: `Your ${pkg.packageType} package has expired. ${creditsToDeduct / 2} unused consultation${creditsToDeduct / 2 !== 1 ? 's were' : ' was'} forfeited. Purchase a new package to continue.`,
            isRead: false,
            actionUrl: '/pricing'
          }
        })

        expiredCount++
        creditsExpired += creditsToDeduct
      })
    }

    // 7-day warnings
    const packagesExpiringSoon7 = await prisma.creditPackage.findMany({
      where: {
        status: PackageStatus.ACTIVE,
        expiresAt: { gte: now, lte: sevenDaysFromNow },
        creditsRemaining: { gt: 0 }
      },
      include: { user: true }
    })

    for (const pkg of packagesExpiringSoon7) {
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: pkg.userId,
          type: NotificationType.CREDIT_EXPIRY,
          message: { contains: '7 days' },
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        }
      })

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: pkg.userId,
            type: NotificationType.CREDIT_EXPIRY,
            title: 'Credits Expiring Soon',
            message: `Your ${pkg.packageType} package expires in 7 days! You have ${pkg.creditsRemaining / 2} consultation${pkg.creditsRemaining / 2 !== 1 ? 's' : ''} remaining. Book now before they expire.`,
            isRead: false,
            actionUrl: '/doctors'
          }
        })
      }
    }

    // 3-day warnings
    const packagesExpiringSoon3 = await prisma.creditPackage.findMany({
      where: {
        status: PackageStatus.ACTIVE,
        expiresAt: { gte: now, lte: threeDaysFromNow },
        creditsRemaining: { gt: 0 }
      },
      include: { user: true }
    })

    for (const pkg of packagesExpiringSoon3) {
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: pkg.userId,
          type: NotificationType.CREDIT_EXPIRY,
          message: { contains: '3 days' },
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        }
      })

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: pkg.userId,
            type: NotificationType.CREDIT_EXPIRY,
            title: '⚠️ Credits Expiring in 3 Days!',
            message: `URGENT: Your ${pkg.packageType} package expires in 3 days! Don't lose your ${pkg.creditsRemaining / 2} remaining consultation${pkg.creditsRemaining / 2 !== 1 ? 's' : ''}. Book now!`,
            isRead: false,
            actionUrl: '/doctors'
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      expired: expiredCount,
      creditsExpired: creditsExpired / 2,
      warnings7Days: packagesExpiringSoon7.length,
      warnings3Days: packagesExpiringSoon3.length,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error('Credit expiry cron error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error?.message },
      { status: 500 }
    )
  }
} 

// Manual trigger
export async function POST(req) {
  return GET(req)
}


