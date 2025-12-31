// lib/checkUser.js
import { currentUser } from '@clerk/nextjs/server'
import { db } from './db'

export const checkUser = async () => {
  let user

  try {
    user = await currentUser()
  } catch {
    return null
  }

  if (!user) return null

  try {
    // First, try to find the existing user
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
        licenseNumber: true,
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
    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      console.error('No email found for user:', user.id)
      return null
    }

    // Use upsert instead of create to handle race conditions
    try {
      const newUser = await db.$transaction(async (tx) => {
        // Try to create the user, but handle unique constraint errors
        let createdUser
        
        try {
          createdUser = await tx.user.create({
            data: {
              clerkUserId: user.id,
              name,
              imageUrl: user.imageUrl,
              email,
              credits: 2,
              role: 'UNASSIGNED',
              verificationStatus: 'PENDING',
            },
          })
        } catch (createError) {
          // If create fails due to unique constraint, try to find the user
          if (createError.code === 'P2002' && createError.meta?.target?.includes('clerkUserId')) {
            // User was created by another request, fetch it
            createdUser = await tx.user.findUnique({
              where: { clerkUserId: user.id },
            })
            
            if (!createdUser) {
              throw createError // Re-throw if user still not found
            }
            
            // User already exists, just return it
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
              licenseNumber: createdUser.licenseNumber,
              createdAt: createdUser.createdAt,
              creditPackages: [],
            }
          }
          throw createError // Re-throw other errors
        }

        // Only create transactions and notifications if we actually created a new user
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
          licenseNumber: createdUser.licenseNumber,
          createdAt: createdUser.createdAt,
          creditPackages: [],
        }
      })

      return newUser
    } catch (transactionError) {
      // If transaction fails, try to fetch the user one more time
      if (transactionError.code === 'P2002' || transactionError.code === 'P2034') {
        const fallbackUser = await db.user.findUnique({
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
            speciality: true,
            experience: true,
            verificationStatus: true,
            doctorStatus: true,
            rating: true,
            totalReviews: true,
            isAvailable: true,
            bio: true,
            licenseNumber: true,
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
        
        if (fallbackUser) {
          return fallbackUser
        }
      }
      throw transactionError
    }
  } catch (error) {
    console.error('Error in checkUser:', error)
    
    // For production, you might want to handle this more gracefully
    // For now, return null to avoid breaking the app
    return null
  }
}
