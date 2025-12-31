'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function resubmitVerification(formData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true, verificationStatus: true }
    })

    if (!user) throw new Error("User not found")
    if (user.role !== "DOCTOR") throw new Error("Only doctors can resubmit verification")
    if (user.verificationStatus !== "REJECTED") {
      throw new Error("Only rejected verifications can be resubmitted")
    }

    const speciality = formData.get("speciality")
    const experience = parseInt(formData.get("experience"), 10)
    const licenseNumber = formData.get("licenseNumber")
    const credentialUrl = formData.get("credentialUrl")
    const bio = formData.get("bio")
    const phone = formData.get("phone")
    const city = formData.get("city")

    if (!speciality || !experience || !licenseNumber || !credentialUrl || !bio || !phone) {
      throw new Error("All required fields must be filled")
    }

    if (experience < 1 || experience > 50) {
      throw new Error("Experience must be between 1 and 50 years")
    }

    // Check if license number already exists for another user
    const existingDoctor = await db.user.findFirst({
      where: {
        licenseNumber: licenseNumber,
        clerkUserId: { not: userId }
      }
    })

    if (existingDoctor) {
      throw new Error("This license number is already registered by another doctor")
    }

    await db.user.update({
      where: { clerkUserId: userId },
      data: {
        speciality,
        experience,
        licenseNumber,
        credentialUrl,
        bio,
        phone,
        city,
        verificationStatus: "PENDING", 
        updatedAt: new Date(),
      }
    })

    // Create notification for the doctor
    await db.notification.create({
      data: {
        userId: user.id,
        type: 'VERIFICATION',
        title: 'Verification Resubmitted',
        message: 'Your updated credentials have been submitted for review. Our team will verify them within 24-48 hours.',
        actionUrl: '/doctor/verification',
      },
    })

    revalidatePath("/doctor/verification")
    return { success: true, message: "Verification resubmitted successfully" }
  } catch (error) {
    console.error('Error resubmitting verification:', error)
    return { success: false, error: error.message }
  }
}
