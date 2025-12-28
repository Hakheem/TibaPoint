// lib/checkUser.js
import { currentUser } from '@clerk/nextjs/server'
import { db } from './db'

export const checkUser = async () => {
  let user

  try {
    user = await currentUser()
  } catch {
    // Clerk auth not available (public route)
    return null
  }

  if (!user) return null

  try {
    const existingUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        credits: true,
        phone: true,
        city: true,
        // Doctor fields
        speciality: true,
        experience: true,
        verificationStatus: true,
        doctorStatus: true,
        rating: true,
        totalReviews: true,
        isAvailable: true,
        bio: true,
        createdAt: true,
        creditPackages: {
          where: {
            status: 'ACTIVE',
            expiresAt: { gte: new Date() },
          },
          orderBy: { purchasedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (existingUser) return existingUser

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim()

    const newUser = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0].emailAddress,
          credits: 2, // 1 free consultation
          role: 'UNASSIGNED',
          verificationStatus: 'PENDING', // Will be updated during onboarding
        },
      })

      await tx.creditTransaction.create({
        data: {
          userId: createdUser.id,
          amount: 2,
          type: 'WELCOME_BONUS',
          description: 'Welcome bonus: 1 free consultation (2 credits)',
          balanceBefore: 0,
          balanceAfter: 2,
        },
      })

      await tx.notification.create({
        data: {
          userId: createdUser.id,
          type: 'SYSTEM',
          title: 'Welcome to TibaPoint!',
          message:
            "You've received 1 free consultation to get started. Book your first appointment with any verified doctor.",
        },
      })

      // Return with all fields needed by Navbar
      return {
        id: createdUser.id,
        clerkUserId: createdUser.clerkUserId,
        email: createdUser.email,
        name: createdUser.name,
        imageUrl: createdUser.imageUrl,
        role: createdUser.role,
        credits: createdUser.credits,
        phone: createdUser.phone,
        city: createdUser.city,
        speciality: createdUser.speciality,
        experience: createdUser.experience,
        verificationStatus: createdUser.verificationStatus,
        doctorStatus: createdUser.doctorStatus,
        rating: createdUser.rating,
        totalReviews: createdUser.totalReviews,
        isAvailable: createdUser.isAvailable,
        bio: createdUser.bio,
        createdAt: createdUser.createdAt,
        creditPackages: [],
      }
    })

    return newUser
  } catch (error) {
    console.error('Error in checkUser:', error)
    return null
  }
}

