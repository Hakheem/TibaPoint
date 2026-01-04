"use server";

import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server' 
import { revalidatePath } from 'next/cache'


export async function getDoctorsBySpeciality(speciality) {
  try {
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
        doctorStatus: "ACTIVE",
        speciality: speciality || undefined, 
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
        rating: "desc", // Show highest rated first
      },
    });
    return { doctors };
  } catch (error) {
    console.error("Failed to fetch doctors by speciality:", error);
    return { error: "Failed to fetch doctors" };
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

    return { doctors };
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
    return { error: "Failed to fetch doctors" };
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
      return { error: "Doctor not found" };
    }

    return { doctor };
  } catch (error) {
    console.error("Failed to fetch doctor profile:", error);
    return { error: "Failed to fetch doctor profile" };
  }
}

// ============================================
// DOCTOR FUNCTIONS (Auth Required)
// ============================================

/**
 * Get current doctor's full profile
 * Used by: Doctor dashboard
 */
export async function  getDoctorProfile() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
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
      throw new Error("Doctor not found");
    }

    return { doctor };
  } catch (error) {
    console.error("Failed to fetch doctor profile:", error);
    throw new Error("Failed to fetch doctor profile: " + error.message);
  }
}


export async function updateDoctorProfile(formData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
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

    revalidatePath("/doctor");
    return { success: true, doctor: updatedDoctor };
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw new Error("Failed to update profile: " + error.message);
  }
}


export async function getDoctorStats() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
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

    // Calculate total earnings
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
      totalAppointments,
      completedAppointments,
      upcomingAppointments,
      totalEarnings,
      rating: doctor.rating,
      totalReviews: doctor.totalReviews,
      creditBalance: doctor.creditBalance,
    };
  } catch (error) {
    console.error("Failed to fetch doctor stats:", error);
    throw new Error("Failed to fetch stats: " + error.message);
  }
}

// ============================================
// AVAILABILITY MANAGEMENT
// ============================================

export async function setAvailability(dayOfWeek, startTime, endTime) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Validate inputs
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error("Invalid day of week");
    }

    if (!startTime || !endTime) {
      throw new Error("Start time and end time are required");
    }

    // Check if availability already exists for this day
    const existing = await db.availability.findFirst({
      where: {
        doctorId: doctor.id,
        dayOfWeek: dayOfWeek,
      },
    });

    if (existing) {
      // Update existing
      const updated = await db.availability.update({
        where: { id: existing.id },
        data: {
          startTime,
          endTime,
          isAvailable: true,
        },
      });

      revalidatePath("/doctor/availability");
      return { success: true, availability: updated };
    } else {
      // Create new
      const newAvailability = await db.availability.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek,
          startTime,
          endTime,
          isAvailable: true,
        },
      });

      revalidatePath("/doctor/availability");
      return { success: true, availability: newAvailability };
    }
  } catch (error) {
    console.error("Failed to set availability:", error);
    throw new Error("Failed to set availability: " + error.message);
  }
}


export async function getDoctorAvailability() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const availabilitySlots = await db.availability.findMany({
      where: {
        doctorId: doctor.id,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return { slots: availabilitySlots };
  } catch (error) {
    console.error("Failed to fetch availability:", error);
    throw new Error("Failed to fetch availability: " + error.message);
  }
}


export async function deleteAvailability(availabilityId) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Verify this availability belongs to this doctor
    const availability = await db.availability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability || availability.doctorId !== doctor.id) {
      throw new Error("Availability not found");
    }

    await db.availability.delete({
      where: { id: availabilityId },
    });

    revalidatePath("/doctor/availability");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete availability:", error);
    throw new Error("Failed to delete availability: " + error.message);
  }
}


export async function toggleDoctorAvailability() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const updated = await db.user.update({
      where: { id: doctor.id },
      data: {
        isAvailable: !doctor.isAvailable,
      },
    });

    revalidatePath("/doctor");
    return { success: true, isAvailable: updated.isAvailable };
  } catch (error) {
    console.error("Failed to toggle availability:", error);
    throw new Error("Failed to toggle availability: " + error.message);
  }
}

// ============================================
// APPOINTMENT MANAGEMENT
// ============================================

export async function getDoctorAppointments(filter = "all") {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const now = new Date();
    let whereClause = { doctorId: doctor.id };

    if (filter === "upcoming") {
      whereClause.startTime = { gte: now };
      whereClause.status = { in: ["SCHEDULED", "CONFIRMED"] };
    } else if (filter === "past") {
      whereClause.OR = [
        { startTime: { lt: now } },
        { status: "COMPLETED" },
      ];
    } else if (filter === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      whereClause.startTime = { gte: startOfDay, lte: endOfDay };
    }

    const appointments = await db.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        startTime: filter === "past" ? "desc" : "asc",
      },
    });

    return { appointments };
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    throw new Error("Failed to fetch appointments: " + error.message);
  }
}

/**
 * Complete appointment and add notes
 * Used by: After consultation
 */
export async function completeAppointment(appointmentId, notes, diagnosis, prescription) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.doctorId !== doctor.id) {
      throw new Error("Appointment not found");
    }

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        notes,
        diagnosis,
        prescription,
      },
    });

    // Create notification for patient
    await db.notification.create({
      data: {
        userId: appointment.patientId,
        type: "APPOINTMENT",
        title: "Consultation Completed",
        message: `Your consultation with Dr. ${doctor.name} has been completed. Prescription and notes have been added to your records.`,
        actionUrl: `/appointments/${appointmentId}`,
      },
    });

    revalidatePath("/doctor/appointments");
    return { success: true, appointment: updated };
  } catch (error) {
    console.error("Failed to complete appointment:", error);
    throw new Error("Failed to complete appointment: " + error.message);
  }
}


