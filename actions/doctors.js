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
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' },
          ],
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
// AVAILABILITY MANAGEMENT (UPDATED FOR HOURLY SLOTS)
// ============================================

export async function setAvailability(dayOfWeek, startTime, endTime, slotId = null) {
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

    // If editing an existing slot
    if (slotId) {
      // Verify the slot belongs to this doctor
      const existingSlot = await db.availability.findUnique({
        where: { id: slotId },
      });

      if (!existingSlot || existingSlot.doctorId !== doctor.id) {
        return { success: false, error: "Slot not found or unauthorized" };
      }

      // Check if the updated time conflicts with another slot
      const conflict = await db.availability.findFirst({
        where: {
          doctorId: doctor.id,
          dayOfWeek: dayOfWeek,
          startTime: startTime,
          id: { not: slotId }, // Exclude the current slot being edited
        },
      });

      if (conflict) {
        return { success: false, error: "This time slot already exists" };
      }

      const result = await db.availability.update({
        where: { id: slotId },
        data: {
          dayOfWeek,
          startTime,
          endTime,
          isAvailable: true,
        },
      });
      
      revalidatePath("/dashboard/availability");
      return { success: true, availability: result };
    }

    // Check if this exact slot already exists (prevent duplicates)
    const existing = await db.availability.findFirst({
      where: {
        doctorId: doctor.id,
        dayOfWeek: dayOfWeek,
        startTime: startTime,
      },
    });

    if (existing) {
      return { success: false, error: "This time slot already exists" };
    }

    // Create new slot
    const result = await db.availability.create({
      data: {
        doctorId: doctor.id,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: true,
      },
    });

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
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
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

export async function getDoctorAvailableSlots(doctorId, targetDate) {
  try {
    // Get the day of week from targetDate (0 = Sunday, 6 = Saturday)
    const dayOfWeek = new Date(targetDate).getDay();

    // Get doctor's availability slots for this day
    const availabilitySlots = await db.availability.findMany({
      where: {
        doctorId: doctorId,
        dayOfWeek: dayOfWeek,
        isAvailable: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Get all booked appointments for this doctor on this date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await db.appointment.findMany({
      where: {
        doctorId: doctorId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
        },
      },
      select: {
        startTime: true,
      },
    });

    // Create a set of booked time strings for easy lookup
    const bookedTimes = new Set(
      bookedAppointments.map(apt => {
        const hours = apt.startTime.getHours().toString().padStart(2, '0');
        const minutes = apt.startTime.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      })
    );

    // Filter out booked slots
    const availableSlots = availabilitySlots.filter(slot => {
      return !bookedTimes.has(slot.startTime);
    });

    return { success: true, slots: availableSlots };
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
    return { success: false, error: "Failed to fetch available slots" };
  }
}


// DOCTOR APPOINTMENT FUNCTIONS
export async function getDoctorAppointments(filter = "all") {
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
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
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

    return { success: true, appointments };
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return { success: false, error: "Failed to fetch appointments" };
  }
}

export async function getAppointmentById(appointmentId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Build where clause based on role
    let whereClause = { id: appointmentId };
    
    if (user.role === "DOCTOR") {
      whereClause.doctorId = user.id;
    } else if (user.role === "PATIENT") {
      whereClause.patientId = user.id;
    }
    // ADMIN can see all appointments (no additional filter)

    const appointment = await db.appointment.findUnique({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            address: true,
            city: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            speciality: true,
            phone: true,
            email: true,
          },
        },
        review: true,
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    return { success: true, appointment };
  } catch (error) {
    console.error("Failed to fetch appointment:", error);
    return { success: false, error: "Failed to fetch appointment" };
  }
}

export async function completeAppointment(appointmentId, notes, diagnosis, prescription) {
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

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.doctorId !== doctor.id) {
      return { success: false, error: "Appointment not found" };
    }

    if (appointment.status === "COMPLETED") {
      return { success: false, error: "Appointment already completed" };
    }

    if (appointment.status === "CANCELLED") {
      return { success: false, error: "Cannot complete a cancelled appointment" };
    }

    // Calculate actual duration if startedAt exists
    let actualDuration = null;
    if (appointment.startedAt) {
      const completedTime = new Date();
      const startedTime = new Date(appointment.startedAt);
      actualDuration = Math.round((completedTime - startedTime) / 60000); // Convert to minutes
    }

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        actualDuration,
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

    revalidatePath("/dashboard/appointments");
    revalidatePath(`/dashboard/appointments/${appointmentId}`);
    return { success: true, appointment: updated };
  } catch (error) {
    console.error("Failed to complete appointment:", error);
    return { success: false, error: "Failed to complete appointment" };
  }
}

export async function startAppointment(appointmentId) {
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

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.doctorId !== doctor.id) {
      return { success: false, error: "Appointment not found" };
    }

    if (appointment.status !== "SCHEDULED" && appointment.status !== "CONFIRMED") {
      return { success: false, error: "Cannot start this appointment" };
    }

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    // Create notification for patient
    await db.notification.create({
      data: {
        userId: appointment.patientId,
        type: "APPOINTMENT",
        title: "Consultation Started",
        message: `Dr. ${doctor.name} has started your consultation.`,
        actionUrl: `/appointments/${appointmentId}`,
      },
    });

    revalidatePath("/dashboard/appointments");
    revalidatePath(`/dashboard/appointments/${appointmentId}`);
    return { success: true, appointment: updated };
  } catch (error) {
    console.error("Failed to start appointment:", error);
    return { success: false, error: "Failed to start appointment" };
  }
}

export async function cancelAppointment(appointmentId, reason) {
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

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.doctorId !== doctor.id) {
      return { success: false, error: "Appointment not found" };
    }

    if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
      return { success: false, error: "Cannot cancel this appointment" };
    }

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        cancelledBy: "DOCTOR",
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    });

    // Create notification for patient
    await db.notification.create({
      data: {
        userId: appointment.patientId,
        type: "APPOINTMENT",
        title: "Appointment Cancelled",
        message: `Your appointment with Dr. ${doctor.name} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
        actionUrl: `/appointments/${appointmentId}`,
      },
    });

    revalidatePath("/dashboard/appointments");
    revalidatePath(`/dashboard/appointments/${appointmentId}`);
    return { success: true, appointment: updated };
  } catch (error) {  // ✅ Fixed: was 'Error'
    console.error("Failed to cancel appointment:", error);
    return { success: false, error: "Failed to cancel appointment" };
  }
}

// BULK AVAILABILITY MANAGEMENT
export async function bulkSetAvailability(slots) {
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
    if (!Array.isArray(slots) || slots.length === 0) {
      return { success: false, error: "No slots provided" };
    }

    const validSlots = slots.filter(slot => 
      slot.dayOfWeek >= 0 && 
      slot.dayOfWeek <= 6 && 
      slot.startTime && 
      slot.endTime
    );

    if (validSlots.length === 0) {
      return { success: false, error: "No valid slots provided" };
    }

    // Get existing slots for this doctor to check for conflicts
    const existingSlots = await db.availability.findMany({
      where: {
        doctorId: doctor.id,
      },
      select: {
        dayOfWeek: true,
        startTime: true,
      },
    });

    // Create a set of existing slot keys for quick lookup
    const existingSlotKeys = new Set(
      existingSlots.map(slot => `${slot.dayOfWeek}:${slot.startTime}`)
    );

    // Filter out slots that already exist
    const newSlots = validSlots.filter(slot => {
      const slotKey = `${slot.dayOfWeek}:${slot.startTime}`;
      return !existingSlotKeys.has(slotKey);
    });

    if (newSlots.length === 0) {
      return { 
        success: false, 
        error: "All selected slots already exist" 
      };
    }

    // Create all new slots in a single transaction
    const results = await db.$transaction(
      newSlots.map(slot =>
        db.availability.create({
          data: {
            doctorId: doctor.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: true,
          },
        })
      )
    );

    revalidatePath("/dashboard/availability");
    
    return { 
      success: true, 
      count: results.length,
      created: results.length,
      skipped: validSlots.length - newSlots.length
    };
  } catch (error) {
    console.error("Failed to bulk set availability:", error);
    return { success: false, error: "Failed to save slots" };
  }
}