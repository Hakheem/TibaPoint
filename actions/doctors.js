"use server";

import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server' 
import { revalidatePath } from 'next/cache'

// ============================================
// PUBLIC DOCTOR FUNCTIONS (No Auth Required)
// ============================================

export async function getDoctorsBySpeciality(speciality) {
  try {
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
        doctorStatus: "ACTIVE",
        ...(speciality && { speciality }),
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        speciality: true,
        experience: true,
        bio: true,
        rating: true,
        totalReviews: true,
        city: true,
        consultationFee: true,
        isAvailable: true,
      },
      orderBy: {
        rating: "desc",
      },
    });
    
    return { success: true, doctors };
  } catch (error) {
    console.error("Failed to fetch doctors by speciality:", error);
    return { success: false, error: "Failed to fetch doctors" };
  }
}

export async function getAllVerifiedDoctors(filters = {}) {
  try {
    const { search, city, minRating } = filters;

    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
        doctorStatus: "ACTIVE",
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { speciality: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(city && { city }),
        ...(minRating && { rating: { gte: minRating } }),
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        speciality: true,
        experience: true,
        bio: true,
        rating: true,
        totalReviews: true,
        city: true,
        consultationFee: true,
        isAvailable: true,
      },
      orderBy: {
        rating: "desc",
      },
    });

    return { success: true, doctors };
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
    return { success: false, error: "Failed to fetch doctors" };
  }
}

export async function getDoctorPublicProfile(doctorId) {
  try {
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        speciality: true,
        experience: true,
        bio: true,
        rating: true,
        totalReviews: true,
        city: true,
        consultationFee: true,
        isAvailable: true,
        reviewsReceived: {
          where: { isPublic: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            patient: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    return { success: true, doctor };
  } catch (error) {
    console.error("Failed to fetch doctor profile:", error);
    return { success: false, error: "Failed to fetch doctor profile" };
  }
}

// ============================================
// DOCTOR FUNCTIONS (Auth Required)
// ============================================

export async function getDoctorProfile() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
      include: {
        availabilities: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    return { success: true, doctor };
  } catch (error) {
    console.error("Failed to fetch doctor profile:", error);
    return { success: false, error: "Failed to fetch doctor profile" };
  }
}

export async function updateDoctorProfile(formData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    const bio = formData.get("bio");
    const phone = formData.get("phone");
    const city = formData.get("city");

    const updatedDoctor = await db.user.update({
      where: { id: doctor.id },
      data: {
        ...(bio && { bio }),
        ...(phone && { phone }),
        ...(city && { city }),
      },
    });

    revalidatePath("/dashboard");
    return { success: true, doctor: updatedDoctor };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getDoctorStats() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    // Total appointments
    const totalAppointments = await db.appointment.count({
      where: { doctorId: doctor.id },
    });

    // Completed appointments
    const completedAppointments = await db.appointment.count({
      where: {
        doctorId: doctor.id,
        status: "COMPLETED",
      },
    });

    // Upcoming appointments
    const upcomingAppointments = await db.appointment.count({
      where: {
        doctorId: doctor.id,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        startTime: { gte: new Date() },
      },
    });

    // Calculate total earnings using doctorEarnings field
    const appointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "COMPLETED",
      },
      select: {
        doctorEarnings: true,
      },
    });

    const totalEarnings = appointments.reduce(
      (sum, apt) => sum + (apt.doctorEarnings || 0),
      0
    );

    return {
      success: true,
      stats: {
        totalAppointments,
        completedAppointments,
        upcomingAppointments,
        totalEarnings: Math.round(totalEarnings),
        rating: doctor.rating || 0,
        totalReviews: doctor.totalReviews,
        creditBalance: doctor.creditBalance || 0,
      }
    };
  } catch (error) {
    console.error("Failed to fetch doctor stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

// ============================================
// AVAILABILITY MANAGEMENT
// ============================================

export async function setAvailability(dayOfWeek, startTime, endTime) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    // Validate inputs
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return { success: false, error: "Invalid day of week" };
    }

    if (!startTime || !endTime) {
      return { success: false, error: "Start time and end time are required" };
    }

    // Check if availability already exists for this day
    const existing = await db.availability.findFirst({
      where: {
        doctorId: doctor.id,
        dayOfWeek: dayOfWeek,
      },
    });

    let result;
    if (existing) {
      // Update existing
      result = await db.availability.update({
        where: { id: existing.id },
        data: {
          startTime,
          endTime,
          isAvailable: true,
        },
      });
    } else {
      // Create new
      result = await db.availability.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek,
          startTime,
          endTime,
          isAvailable: true,
        },
      });
    }

    revalidatePath("/dashboard/availability");
    return { success: true, availability: result };
  } catch (error) {
    console.error("Failed to set availability:", error);
    return { success: false, error: "Failed to set availability" };
  }
}

export async function getDoctorAvailability() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    const availabilitySlots = await db.availability.findMany({
      where: {
        doctorId: doctor.id,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return { success: true, slots: availabilitySlots };
  } catch (error) {
    console.error("Failed to fetch availability:", error);
    return { success: false, error: "Failed to fetch availability" };
  }
}

export async function deleteAvailability(availabilityId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    // Verify this availability belongs to this doctor
    const availability = await db.availability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability || availability.doctorId !== doctor.id) {
      return { success: false, error: "Availability not found" };
    }

    await db.availability.delete({
      where: { id: availabilityId },
    });

    revalidatePath("/dashboard/availability");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete availability:", error);
    return { success: false, error: "Failed to delete availability" };
  }
}

export async function toggleDoctorAvailability() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    const updated = await db.user.update({
      where: { id: doctor.id },
      data: {
        isAvailable: !doctor.isAvailable,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/availability");
    return { success: true, isAvailable: updated.isAvailable };
  } catch (error) {
    console.error("Failed to toggle availability:", error);
    return { success: false, error: "Failed to toggle availability" };
  }
}

