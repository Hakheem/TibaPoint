'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Set user role 
export async function setUserRole(formData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")  
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId
    }
  })

  if (!user) throw new Error("User not found in database")

  const role = formData.get('role')

  if (!role || !["PATIENT", "DOCTOR"].includes(role)) {
    throw new Error("Invalid role selection")
  }

  try {
    if (role === "PATIENT") {
      // For patients, update role and set as VERIFIED immediately
      await db.user.update({
        where: { clerkUserId: userId },
        data: { 
          role: "PATIENT",
          verificationStatus: "VERIFIED" 
        }
      })

      await db.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Welcome to TibaPoint.',
          message: 'Your account is ready. Start browsing verified doctors and book your first consultation.',
          actionUrl: '/doctors',
        },
      })

      revalidatePath("/")
      return { success: true, redirect: "/doctors" }
    }

    if (role === "DOCTOR") {
      const speciality = formData.get("speciality")
      const experience = parseInt(formData.get("experience"), 10)
      const licenseNumber = formData.get("licenseNumber")
      const credentialUrl = formData.get("credentialUrl")
      const bio = formData.get("bio")
      const phone = formData.get("phone")
      const city = formData.get("city")

      // Validation
      if (!speciality || !experience || !licenseNumber || !credentialUrl || !bio || !phone) {
        throw new Error("All required fields must be filled")
      }

      if (experience < 1 || experience > 50) {
        throw new Error("Experience must be between 1 and 50 years")
      }

      // Check if license number already exists
      const existingDoctor = await db.user.findFirst({
        where: {
          licenseNumber: licenseNumber,
          id: { not: user.id }
        }
      })

      if (existingDoctor) {
        throw new Error("This license number is already registered")
      }

      await db.user.update({
        where: {
          clerkUserId: userId
        },
        data: {
          role: "DOCTOR",
          speciality,
          experience,
          licenseNumber,
          credentialUrl,
          bio,
          phone,
          city,
          verificationStatus: "PENDING", 
          doctorStatus: "ACTIVE",
          consultationFee: 2, 
          isAvailable: false, 
        }
      })

      // Create notification
      await db.notification.create({
        data: {
          userId: user.id,
          type: 'VERIFICATION',
          title: 'Profile Submitted for Verification',
          message: 'Your doctor profile has been submitted. Our team will verify your credentials within 24-48 hours. You\'ll receive an email once approved.',
          actionUrl: '/doctor/verification-pending',
        },
      })

      revalidatePath("/")
      return { success: true, redirect: "/doctor/verification" }
    }

    throw new Error("Invalid role")

  } catch (error) {
    console.error('Error setting user role:', error)
    return { success: false, error: error.message }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId
      },
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
      }
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

