"use server";

import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';




// AGORA VIDEO 
const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const AGORA_EXPIRE_TIME = 3600; 

export async function generateAgoraToken(appointmentId, userId, role = "doctor") {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify user has access to this appointment
    const user = await db.user.findUnique({
      where: { clerkUserId: authUserId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    // Check if user is either patient or doctor for this appointment
    if (user.id !== appointment.patientId && user.id !== appointment.doctorId) {
      return { success: false, error: "Access denied" };
    }

    // Check appointment status
    if (appointment.status !== "CONFIRMED" && appointment.status !== "IN_PROGRESS") {
      return { success: false, error: "Appointment is not active" };
    }

    // Check if appointment time is within valid range
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const endTime = appointment.endTime ? new Date(appointment.endTime) : new Date(startTime.getTime() + 90 * 60000); // 90 minutes default

    // Allow joining 15 minutes before start time and up to 15 minutes after end time
    const canJoinStart = new Date(startTime.getTime() - 15 * 60000);
    const canJoinEnd = new Date(endTime.getTime() + 15 * 60000);

    if (now < canJoinStart) {
      return { success: false, error: "Appointment has not started yet" };
    }

    if (now > canJoinEnd) {
      return { success: false, error: "Appointment has ended" };
    }

    // Generate unique channel name using appointment ID
    const channelName = `appointment_${appointmentId}`;
    const uid = userId; // Using user ID as Agora UID
    
    // Determine role (doctor is host, patient is audience)
    const agoraRole = role === "doctor" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    
    // Calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + AGORA_EXPIRE_TIME;
    
    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      agoraRole,
      privilegeExpireTime
    );

    // If this is the first time generating token for this appointment, update the appointment
    if (!appointment.videoSessionId) {
      await db.appointment.update({
        where: { id: appointmentId },
        data: {
          videoSessionId: `session_${appointmentId}`,
          channelName: channelName,
          agoraUid: parseInt(uid) || 0,
          videoSessionToken: token,
        },
      });
    }

    return {
      success: true,
      token,
      channelName,
      uid,
      appId: AGORA_APP_ID,
      role: agoraRole,
      appointment,
    };
  } catch (error) {
    console.error("Failed to generate Agora token:", error);
    return { success: false, error: "Failed to generate video token" };
  }
}

export async function startVideoSession(appointmentId) {
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

    // Check if appointment can be started (within 15 minutes of start time)
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const canStartTime = new Date(startTime.getTime() - 15 * 60000);

    if (now < canStartTime) {
      return { success: false, error: "Cannot start session yet. You can start 15 minutes before the scheduled time." };
    }

    // Check if appointment is already completed or cancelled
    if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
      return { success: false, error: "Cannot start a completed or cancelled appointment" };
    }

    // Update appointment status and start recording timer
    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "IN_PROGRESS",
        startedAt: now,
        recordingStartTime: now,
      },
    });

    // Create notification for patient
    await db.notification.create({
      data: {
        userId: appointment.patientId,
        type: "APPOINTMENT",
        title: "Consultation Started",
        message: `Dr. ${doctor.name} has started your video consultation. Click to join.`,
        actionUrl: `/appointments/${appointmentId}/join`,
        relatedId: appointmentId,
      },
    });

    revalidatePath(`/dashboard/appointments/${appointmentId}`);
    return { success: true, appointment: updatedAppointment };
  } catch (error) {
    console.error("Failed to start video session:", error);
    return { success: false, error: "Failed to start video session" };
  }
}

export async function endVideoSession(appointmentId, notes, diagnosis, prescription) {
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

    if (appointment.status !== "IN_PROGRESS") {
      return { success: false, error: "Appointment is not in progress" };
    }

    const now = new Date();
    
    // Calculate actual duration in minutes
    let actualDuration = null;
    if (appointment.startedAt) {
      const startedTime = new Date(appointment.startedAt);
      actualDuration = Math.round((now - startedTime) / 60000);
    }

    // Calculate recording duration if recording was started
    let recordingDuration = null;
    if (appointment.recordingStartTime) {
      const recordingStart = new Date(appointment.recordingStartTime);
      recordingDuration = Math.round((now - recordingStart) / 1000);
    }

    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "COMPLETED",
        completedAt: now,
        actualDuration,
        recordingEndTime: now,
        recordingDuration,
        notes: notes || appointment.notes,
        diagnosis: diagnosis || appointment.diagnosis,
        prescription: prescription || appointment.prescription,
      },
    });

    // Create notification for patient
    await db.notification.create({
      data: {
        userId: appointment.patientId,
        type: "APPOINTMENT",
        title: "Consultation Completed",
        message: `Your consultation with Dr. ${doctor.name} has been completed. View your prescription and notes.`,
        actionUrl: `/appointments/${appointmentId}`,
        relatedId: appointmentId,
      },
    });

    revalidatePath(`/dashboard/appointments/${appointmentId}`);
    return { success: true, appointment: updatedAppointment };
  } catch (error) {
    console.error("Failed to end video session:", error);
    return { success: false, error: "Failed to end video session" };
  }
}

export async function getAgoraConfig(appointmentId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            speciality: true,
          },
        },
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    // Check if user has access
    if (user.id !== appointment.patientId && user.id !== appointment.doctorId) {
      return { success: false, error: "Access denied" };
    }

    // Determine user role for this appointment
    const role = user.id === appointment.doctorId ? "doctor" : "patient";

    return {
      success: true,
      config: {
        appointmentId: appointment.id,
        channelName: appointment.channelName || `appointment_${appointmentId}`,
        role,
        participant: role === "doctor" ? appointment.doctor : appointment.patient,
        counterpart: role === "doctor" ? appointment.patient : appointment.doctor,
        status: appointment.status,
        startTime: appointment.startTime,
        startedAt: appointment.startedAt,
        agoraUid: appointment.agoraUid || user.id,
      },
    };
  } catch (error) {
    console.error("Failed to get Agora config:", error);
    return { success: false, error: "Failed to get video configuration" };
  }
}

// BOOKING FUNCTIONS 

export async function bookAppointmentWithValidation(formData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get patient
    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    // Parse form data
    const doctorId = formData.get("doctorId");
    const availabilitySlotId = formData.get("availabilitySlotId");
    const appointmentDate = formData.get("appointmentDate");
    const patientDescription = formData.get("patientDescription");

    if (!doctorId || !availabilitySlotId || !appointmentDate) {
      return { success: false, error: "Missing required fields" };
    }

    // Verify doctor exists and is available
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
        doctorStatus: "ACTIVE",
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    if (!doctor.isAvailable) {
      return { success: false, error: "Doctor is currently unavailable for appointments" };
    }

    // Get availability slot
    const availabilitySlot = await db.availability.findUnique({
      where: { id: availabilitySlotId },
    });

    if (!availabilitySlot || availabilitySlot.doctorId !== doctorId) {
      return { success: false, error: "Invalid availability slot" };
    }

    // Create appointment datetime
    const appointmentDateTime = new Date(appointmentDate);
    const [hours, minutes] = availabilitySlot.startTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Check if slot is in the past
    const now = new Date();
    if (appointmentDateTime < now) {
      return { success: false, error: "Cannot book appointment in the past" };
    }

    // Check if slot is within 12 hours (minimum booking notice)
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60000);
    if (appointmentDateTime < twelveHoursFromNow) {
      return { success: false, error: "Appointments must be booked at least 12 hours in advance" };
    }

    // Calculate end time (30 minutes after start)
    const endTime = new Date(appointmentDateTime);
    const [endHours, endMinutes] = availabilitySlot.endTime.split(':').map(Number);
    endTime.setHours(endHours, endMinutes, 0, 0);

    // Check if slot is already booked
    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: doctorId,
        startTime: appointmentDateTime,
        status: {
          in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
        },
      },
    });

    if (existingAppointment) {
      return { success: false, error: "This time slot is already booked. Please choose another slot." };
    }

    // Check patient credits - STILL 2 CREDITS FOR 30-MINUTE CONSULTATION
    if (patient.credits < 2) {
      return { success: false, error: "Insufficient credits. You need 2 credits to book a 30-minute appointment. Please purchase a credit package." };
    }

    // Get patient's active package
    const activePackage = await db.creditPackage.findFirst({
      where: {
        userId: patient.id,
        status: "ACTIVE",
        creditsRemaining: { gte: 2 },
        validUntil: { gte: new Date() },
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    });

    let packagePrice = 500; // Default Starter package price
    
    if (activePackage) {
      packagePrice = activePackage.pricePerConsultation;
    }

    // Calculate earnings split
    const platformCommission = 0.12; // 12%
    const platformEarnings = packagePrice * platformCommission;
    const doctorEarnings = packagePrice * (1 - platformCommission); // 88%

    // Create appointment and update credits in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the appointment
      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctorId,
          startTime: appointmentDateTime,
          endTime: endTime,
          status: "SCHEDULED",
          patientDescription: patientDescription || null,
          creditsCharged: 2, // Still 2 credits for 30-minute consultation
          packagePrice: packagePrice,
          platformCommission: platformCommission,
          platformEarnings: platformEarnings,
          doctorEarnings: doctorEarnings,
        },
      });

      // Deduct credits from patient
      await tx.user.update({
        where: { id: patient.id },
        data: {
          credits: {
            decrement: 2,
          },
        },
      });

      // Update package credits if using a package
      if (activePackage) {
        await tx.creditPackage.update({
          where: { id: activePackage.id },
          data: {
            creditsUsed: {
              increment: 2,
            },
            creditsRemaining: {
              decrement: 2,
            },
          },
        });

        // Create transaction record
        await tx.creditTransaction.create({
          data: {
            userId: patient.id,
            packageId: activePackage.id,
            amount: -2,
            type: "SPENT",
            description: `30-minute appointment with Dr. ${doctor.name}`,
            appointmentId: appointment.id,
            balanceBefore: patient.credits,
            balanceAfter: patient.credits - 2,
          },
        });
      }

      // Create notification for doctor
      await tx.notification.create({
        data: {
          userId: doctorId,
          type: "APPOINTMENT",
          title: "New Appointment Booked",
          message: `${patient.name} has booked a 30-minute appointment with you on ${appointmentDateTime.toLocaleDateString()} at ${availabilitySlot.startTime}.`,
          actionUrl: `/dashboard/appointments/${appointment.id}`,
          relatedId: appointment.id,
        },
      });

      // Create notification for patient
      await tx.notification.create({
        data: {
          userId: patient.id,
          type: "APPOINTMENT",
          title: "Appointment Confirmed",
          message: `Your 30-minute appointment with Dr. ${doctor.name} has been confirmed for ${appointmentDateTime.toLocaleDateString()} at ${availabilitySlot.startTime}.`,
          actionUrl: `/appointments/${appointment.id}`,
          relatedId: appointment.id,
        },
      });

      return appointment;
    });

    revalidatePath("/appointments");
    revalidatePath("/dashboard/appointments");
    return { success: true, appointment: result };
  } catch (error) {
    console.error("Failed to book appointment:", error);
    return { success: false, error: "Failed to book appointment. Please try again." };
  }
}

// RESCHEDULING FUNCTIONS (12 HOURS RESTRICTION)

export async function rescheduleAppointment(appointmentId, newAvailabilitySlotId, newAppointmentDate) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    // Check if user is either patient or doctor for this appointment
    if (user.id !== appointment.patientId && user.id !== appointment.doctorId) {
      return { success: false, error: "Access denied" };
    }

    // Check if appointment can be rescheduled (not completed or cancelled)
    if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
      return { success: false, error: "Cannot reschedule a completed or cancelled appointment" };
    }

    // Check 12-hour restriction
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 12) {
      return { success: false, error: "Cannot reschedule appointment within 12 hours of the scheduled time" };
    }

    // Get new availability slot
    const newAvailabilitySlot = await db.availability.findUnique({
      where: { id: newAvailabilitySlotId },
    });

    if (!newAvailabilitySlot || newAvailabilitySlot.doctorId !== appointment.doctorId) {
      return { success: false, error: "Invalid availability slot" };
    }

    // Create new appointment datetime
    const newAppointmentDateTime = new Date(newAppointmentDate);
    const [hours, minutes] = newAvailabilitySlot.startTime.split(':').map(Number);
    newAppointmentDateTime.setHours(hours, minutes, 0, 0);

    // Check if new slot is available
    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: appointment.doctorId,
        startTime: newAppointmentDateTime,
        status: {
          in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
        },
        id: { not: appointmentId }, // Exclude current appointment
      },
    });

    if (existingAppointment) {
      return { success: false, error: "This time slot is already booked. Please choose another slot." };
    }

    // Calculate new end time
    const newEndTime = new Date(newAppointmentDateTime);
    newEndTime.setHours(newEndTime.getHours() + 1);

    // Update appointment
    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime: newAppointmentDateTime,
        endTime: newEndTime,
        status: "SCHEDULED", // Reset status to scheduled
        videoSessionId: null, // Clear previous video session data
        videoSessionToken: null,
        channelName: null,
        agoraUid: null,
        recordingStartTime: null,
        recordingEndTime: null,
        recordingDuration: null,
      },
    });

    // Create notifications
    const initiator = user.id === appointment.patientId ? appointment.patient : appointment.doctor;
    const recipient = user.id === appointment.patientId ? appointment.doctor : appointment.patient;

    await db.notification.create({
      data: {
        userId: recipient.id,
        type: "APPOINTMENT",
        title: "Appointment Rescheduled",
        message: `${initiator.name} has rescheduled the appointment to ${newAppointmentDateTime.toLocaleDateString()} at ${newAvailabilitySlot.startTime}.`,
        actionUrl: `/dashboard/appointments/${appointmentId}`,
        relatedId: appointmentId,
      },
    });

    revalidatePath(`/dashboard/appointments/${appointmentId}`);
    return { success: true, appointment: updatedAppointment };
  } catch (error) {
    console.error("Failed to reschedule appointment:", error);
    return { success: false, error: "Failed to reschedule appointment" };
  }
}

export async function requestReschedule(appointmentId, requestedSlotId, requestedDate, reason) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    // Check if user is either patient or doctor
    if (user.id !== appointment.patientId && user.id !== appointment.doctorId) {
      return { success: false, error: "Access denied" };
    }

    // Check 12-hour restriction
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 12) {
      return { success: false, error: "Cannot request rescheduling within 12 hours of the scheduled time" };
    }

    // This would typically create a reschedule request record
    // For now, we'll create a notification for the other party
    
    const requester = user.id === appointment.patientId ? appointment.patient : appointment.doctor;
    const requestee = user.id === appointment.patientId ? appointment.doctor : appointment.patient;

    await db.notification.create({
      data: {
        userId: requestee.id,
        type: "APPOINTMENT",
        title: "Reschedule Request",
        message: `${requester.name} has requested to reschedule the appointment. Reason: ${reason || "No reason provided"}`,
        actionUrl: `/dashboard/appointments/${appointmentId}/reschedule`,
        relatedId: appointmentId,
      },
    });

    return { success: true, message: "Reschedule request sent" };
  } catch (error) {
    console.error("Failed to request reschedule:", error);
    return { success: false, error: "Failed to send reschedule request" };
  }
}

// APPOINTMENT UTILITIES

export async function checkAppointmentConflict(doctorId, startTime) {
  try {
    const appointmentTime = new Date(startTime);
    
    // Check for existing appointments at the same time
    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: doctorId,
        startTime: appointmentTime,
        status: {
          in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
        },
      },
    });

    return {
      success: true,
      hasConflict: !!existingAppointment,
      conflictingAppointment: existingAppointment,
    };
  } catch (error) {
    console.error("Failed to check appointment conflict:", error);
    return { success: false, error: "Failed to check appointment availability" };
  }
}

export async function getAvailableSlotsForDoctor(doctorId, targetDate) {
  try {
    // Get the day of week from targetDate (0 = Sunday, 6 = Saturday)
    const targetDateTime = new Date(targetDate);
    const dayOfWeek = targetDateTime.getDay();

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

    // Create a set of booked time strings for exact time matching
    const bookedTimes = new Set(
      bookedAppointments.map(apt => {
        const hours = apt.startTime.getHours().toString().padStart(2, '0');
        const minutes = apt.startTime.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      })
    );

    // Filter out booked slots and apply time restrictions
    const now = new Date();
    const isToday = targetDateTime.toDateString() === now.toDateString();
    
    const availableSlots = availabilitySlots.filter(slot => {
      // Check if this exact start time is booked
      if (bookedTimes.has(slot.startTime)) {
        return false;
      }

      // For today's slots, check 12-hour minimum booking notice
      if (isToday) {
        const [hours, minutes] = slot.startTime.split(':').map(Number);
        const slotTime = new Date(targetDateTime);
        slotTime.setHours(hours, minutes, 0, 0);
        
        // 12-hour minimum booking notice
        const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60000);
        return slotTime >= twelveHoursFromNow;
      }

      return true;
    });

    return { success: true, slots: availableSlots };
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
    return { success: false, error: "Failed to fetch available slots" };
  }
}

// In your appointment.js file, add these:

// ============================================
// PATIENT APPOINTMENT FUNCTIONS
// ============================================

export async function getPatientAppointments(filter = "all") {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    const now = new Date();
    let whereClause = { patientId: patient.id };

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

export async function cancelPatientAppointment(appointmentId, reason) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!appointment || appointment.patientId !== patient.id) {
      return { success: false, error: "Appointment not found" };
    }

    if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
      return { success: false, error: "Cannot cancel this appointment" };
    }

    if (appointment.status === "IN_PROGRESS") {
      return { success: false, error: "Cannot cancel an appointment that is in progress" };
    }

    // Calculate refund based on cancellation time
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    let refundCredits = 0;
    let refundReason = null;

    if (hoursUntilAppointment >= 24) {
      // Full refund if cancelled 24+ hours before
      refundCredits = 2;
      refundReason = "UNUSED_PACKAGE";
    } else if (hoursUntilAppointment >= 2) {
      // Partial refund if cancelled 2-24 hours before
      refundCredits = 1;
      refundReason = "LATE_CANCELLATION";
    }
    // No refund if cancelled less than 2 hours before

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        cancelledBy: "PATIENT",
        cancellationReason: reason,
        cancelledAt: now,
        creditsRefunded: refundCredits,
      },
    });

    // Refund credits if applicable
    if (refundCredits > 0) {
      await db.user.update({
        where: { id: patient.id },
        data: {
          credits: {
            increment: refundCredits,
          },
        },
      });

      // Create refund record
      await db.refund.create({
        data: {
          appointmentId: appointmentId,
          userId: patient.id,
          reason: refundReason,
          refundType: refundCredits === 2 ? "FULL" : "PARTIAL",
          originalCredits: 2,
          refundedCredits: refundCredits,
          refundPercentage: (refundCredits / 2) * 100,
          status: "COMPLETED",
          processedAt: now,
        },
      });

      // Create credit transaction
      await db.creditTransaction.create({
        data: {
          userId: patient.id,
          amount: refundCredits,
          type: "REFUND",
          description: `Refund for cancelled appointment with Dr. ${appointment.doctor.name}`,
          appointmentId: appointmentId,
          balanceBefore: patient.credits,
          balanceAfter: patient.credits + refundCredits,
        },
      });
    }

    // Create notification for doctor
    await db.notification.create({
      data: {
        userId: appointment.doctorId,
        type: "APPOINTMENT",
        title: "Appointment Cancelled",
        message: `${patient.name} has cancelled their appointment. ${reason ? `Reason: ${reason}` : ''}`,
        actionUrl: `/dashboard/appointments/${appointmentId}`,
      },
    });

    revalidatePath("/appointments");
    revalidatePath(`/appointments/${appointmentId}`);
    
    return { 
      success: true, 
      appointment: updated,
      refundedCredits: refundCredits,
      message: refundCredits > 0 
        ? `Appointment cancelled. ${refundCredits} credit${refundCredits > 1 ? 's' : ''} refunded.`
        : "Appointment cancelled. No refund due to late cancellation."
    };
  } catch (error) {
    console.error("Failed to cancel appointment:", error);
    return { success: false, error: "Failed to cancel appointment" };
  }
}