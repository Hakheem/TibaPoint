"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const AGORA_EXPIRE_TIME = 3600; // 1 hour

export async function generateAgoraToken(
  appointmentId,
  userId,
  role = "doctor"
) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return { success: false, error: "Unauthorized" };
    }

    const AGORA_APP_ID = process.env.AGORA_ID;
    const AGORA_APP_CERTIFICATE = process.env.AGORA_CERTIFICATE;

    console.log("🔑 Token generation - Checking credentials:", {
      usingAppId: AGORA_APP_ID ? "Found (AGORA_ID)" : "MISSING",
      usingCertificate: AGORA_APP_CERTIFICATE ? "Found" : "MISSING",
      fromEnv: "AGORA_ID and AGORA_CERTIFICATE",
    });

    // Verify Agora credentials exist
    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      console.error("❌ Missing Agora credentials from ENV:", {
        AGORA_ID: process.env.AGORA_ID ? "present" : "MISSING",
        AGORA_CERTIFICATE: process.env.AGORA_CERTIFICATE
          ? "present"
          : "MISSING",
        NEXT_PUBLIC_AGORA_APP_ID: process.env.NEXT_PUBLIC_AGORA_APP_ID
          ? "present"
          : "MISSING",
        AGORA_APP_ID: process.env.AGORA_APP_ID ? "present" : "MISSING",
      });
      return {
        success: false,
        error: "Video service configuration error. Please contact support.",
      };
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
    if (
      appointment.status !== "CONFIRMED" &&
      appointment.status !== "IN_PROGRESS" &&
      appointment.status !== "SCHEDULED"
    ) {
      return { success: false, error: "Appointment is not active" };
    }

    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const endTime = appointment.endTime
      ? new Date(appointment.endTime)
      : new Date(startTime.getTime() + 90 * 60000);

    const canJoinStart = new Date(startTime.getTime() - 15 * 60000);
    const canJoinEnd = new Date(endTime.getTime() + 15 * 60000);

    if (now < canJoinStart) {
      const minutesUntilStart = Math.ceil((canJoinStart - now) / 60000);
      return {
        success: false,
        error: `Appointment starts in ${minutesUntilStart} minutes. You can join 15 minutes before the scheduled time.`,
      };
    }

    if (now > canJoinEnd) {
      return { success: false, error: "Appointment has ended" };
    }

    // Generate unique channel name using appointment ID
    const channelName = `appointment_${appointmentId}`;

    let agoraUid;
    if (userId && !isNaN(parseInt(userId)) && parseInt(userId) > 0) {
      agoraUid = parseInt(userId);
    } else {
      agoraUid = Number(user.id) || Math.floor(Math.random() * 90000) + 10000;
    }

    const agoraRole = RtcRole.PUBLISHER;

    // Calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + AGORA_EXPIRE_TIME;

    console.log("📹 Generating Agora token with:", {
      channelName,
      agoraUid,
      role: agoraRole,
      expiresIn: AGORA_EXPIRE_TIME + "s",
      appId: AGORA_APP_ID,
    });

    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      agoraUid,
      agoraRole,
      privilegeExpireTime
    );

    console.log("✅ Token generated successfully", {
      tokenLength: token.length,
      uid: agoraUid,
    });

    return {
      success: true,
      token,
      channelName,
      uid: agoraUid,
      appId: AGORA_APP_ID,
      role: agoraRole,
      appointment: {
        id: appointment.id,
        status: appointment.status,
        startTime: appointment.startTime,
      },
    };
  } catch (error) {
    console.error("❌ Failed to generate Agora token:", error);
    return {
      success: false,
      error: `Failed to generate video token: ${error.message}`,
    };
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

    const role = user.id === appointment.doctorId ? "doctor" : "patient";

    const agoraUid = Number(user.id);

    const finalUid =
      Number.isInteger(agoraUid) && agoraUid > 0
        ? agoraUid
        : Math.floor(Math.random() * 100000);

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

    console.log("🎬 Agora Config for user:", {
      userId: user.id,
      role,
      uid: finalUid,
      appId,
    });

    return {
      success: true,
      config: {
        appointmentId: appointment.id,
        channelName: `appointment_${appointmentId}`,
        role,
        participant:
          role === "doctor" ? appointment.doctor : appointment.patient,
        counterpart:
          role === "doctor" ? appointment.patient : appointment.doctor,
        status: appointment.status,
        startTime: appointment.startTime,
        startedAt: appointment.startedAt,
        agoraUid: finalUid,
        appId: appId,
      },
    };
  } catch (error) {
    console.error("Failed to get Agora config:", error);
    return { success: false, error: "Failed to get video configuration" };
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
      return {
        success: false,
        error:
          "Cannot start session yet. You can start 15 minutes before the scheduled time.",
      };
    }

    // Check if appointment is already completed or cancelled
    if (
      appointment.status === "COMPLETED" ||
      appointment.status === "CANCELLED"
    ) {
      return {
        success: false,
        error: "Cannot start a completed or cancelled appointment",
      };
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
        actionUrl: `/appointments/${appointmentId}/video`,
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

export async function endVideoSession(
  appointmentId,
  notes,
  diagnosis,
  prescription
) {
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

// BOOKING FUNCTIONS

export async function bookAppointmentWithValidation(formData) {
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

    const doctorId = formData.get("doctorId");
    const availabilitySlotId = formData.get("availabilitySlotId");
    const appointmentDate = formData.get("appointmentDate");
    const patientDescription = formData.get("patientDescription");

    if (!doctorId || !availabilitySlotId || !appointmentDate) {
      return { success: false, error: "Missing required fields" };
    }

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
      return {
        success: false,
        error: "Doctor is currently unavailable for appointments",
      };
    }

    const availabilitySlot = await db.availability.findUnique({
      where: { id: availabilitySlotId },
    });

    if (!availabilitySlot || availabilitySlot.doctorId !== doctorId) {
      return { success: false, error: "Invalid availability slot" };
    }

    const appointmentDateTime = new Date(appointmentDate);
    const [hours, minutes] = availabilitySlot.startTime.split(":").map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    if (appointmentDateTime < now) {
      return { success: false, error: "Cannot book appointment in the past" };
    }

    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60000);
    if (appointmentDateTime < twelveHoursFromNow) {
      return {
        success: false,
        error: "Appointments must be booked at least 12 hours in advance",
      };
    }

    const endTime = new Date(appointmentDateTime);
    const [endHours, endMinutes] = availabilitySlot.endTime
      .split(":")
      .map(Number);
    endTime.setHours(endHours, endMinutes, 0, 0);

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
      return {
        success: false,
        error: "This time slot is already booked. Please choose another slot.",
      };
    }

    if (patient.credits < 2) {
      return {
        success: false,
        error:
          "Insufficient credits. You need 2 credits to book a 30-minute appointment. Please purchase a credit package.",
      };
    }

    const activePackage = await db.creditPackage.findFirst({
      where: {
        userId: patient.id,
        status: "ACTIVE",
        creditsRemaining: { gte: 2 },
        validUntil: { gte: new Date() },
      },
      orderBy: {
        purchasedAt: "desc",
      },
    });

    let packagePrice = 500;

    if (activePackage) {
      packagePrice = activePackage.pricePerConsultation;
    }

    const platformCommission = 0.12;
    const platformEarnings = packagePrice * platformCommission;
    const doctorEarnings = packagePrice * (1 - platformCommission);

    const result = await db.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctorId,
          startTime: appointmentDateTime,
          endTime: endTime,
          status: "SCHEDULED",
          patientDescription: patientDescription || null,
          creditsCharged: 2,
          packagePrice: packagePrice,
          platformCommission: platformCommission,
          platformEarnings: platformEarnings,
          doctorEarnings: doctorEarnings,
        },
      });

      await tx.user.update({
        where: { id: patient.id },
        data: {
          credits: {
            decrement: 2,
          },
        },
      });

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

      // NOTE: create notifications after the transaction to avoid long
      // running work inside the interactive transaction which can cause
      // timeouts. Return the appointment and perform notification writes
      // outside the transaction block.

      return appointment;
    });

    // Create notifications outside the transaction to avoid transaction timeout
    try {
      await Promise.all([
        db.notification.create({
          data: {
            userId: doctorId,
            type: "APPOINTMENT",
            title: "New Appointment Booked",
            message: `${
              patient.name
            } has booked a 30-minute appointment with you on ${appointmentDateTime.toLocaleDateString()} at ${
              availabilitySlot.startTime
            }.`,
            actionUrl: `/dashboard/appointments/${result.id}`,
            relatedId: result.id,
          },
        }),
        db.notification.create({
          data: {
            userId: patient.id,
            type: "APPOINTMENT",
            title: "Appointment Confirmed",
            message: `Your 30-minute appointment with Dr. ${
              doctor.name
            } has been confirmed for ${appointmentDateTime.toLocaleDateString()} at ${
              availabilitySlot.startTime
            }.`,
            actionUrl: `/appointments/${result.id}`,
            relatedId: result.id,
          },
        }),
      ]);
    } catch (notifErr) {
      console.error(
        "Failed to create post-transaction notifications:",
        notifErr
      );
    }

    revalidatePath("/appointments");
    revalidatePath("/dashboard/appointments");
    return { success: true, appointment: result };
  } catch (error) {
    console.error("Failed to book appointment:", error);
    return {
      success: false,
      error: "Failed to book appointment. Please try again.",
    };
  }
}

// RESCHEDULING FUNCTIONS

export async function rescheduleAppointment(
  appointmentId,
  newAvailabilitySlotId,
  newAppointmentDate
) {
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

    if (user.id !== appointment.patientId && user.id !== appointment.doctorId) {
      return { success: false, error: "Access denied" };
    }

    if (
      appointment.status === "COMPLETED" ||
      appointment.status === "CANCELLED"
    ) {
      return {
        success: false,
        error: "Cannot reschedule a completed or cancelled appointment",
      };
    }

    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 12) {
      return {
        success: false,
        error:
          "Cannot reschedule appointment within 12 hours of the scheduled time",
      };
    }

    const newAvailabilitySlot = await db.availability.findUnique({
      where: { id: newAvailabilitySlotId },
    });

    if (
      !newAvailabilitySlot ||
      newAvailabilitySlot.doctorId !== appointment.doctorId
    ) {
      return { success: false, error: "Invalid availability slot" };
    }

    const newAppointmentDateTime = new Date(newAppointmentDate);
    const [hours, minutes] = newAvailabilitySlot.startTime
      .split(":")
      .map(Number);
    newAppointmentDateTime.setHours(hours, minutes, 0, 0);

    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: appointment.doctorId,
        startTime: newAppointmentDateTime,
        status: {
          in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
        },
        id: { not: appointmentId },
      },
    });

    if (existingAppointment) {
      return {
        success: false,
        error: "This time slot is already booked. Please choose another slot.",
      };
    }

    const newEndTime = new Date(newAppointmentDateTime);
    newEndTime.setHours(newEndTime.getHours() + 1);

    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime: newAppointmentDateTime,
        endTime: newEndTime,
        status: "SCHEDULED",
        videoSessionId: null,
        videoSessionToken: null,
        channelName: null,
        agoraUid: null,
        recordingStartTime: null,
        recordingEndTime: null,
        recordingDuration: null,
      },
    });

    const initiator =
      user.id === appointment.patientId
        ? appointment.patient
        : appointment.doctor;
    const recipient =
      user.id === appointment.patientId
        ? appointment.doctor
        : appointment.patient;

    await db.notification.create({
      data: {
        userId: recipient.id,
        type: "APPOINTMENT",
        title: "Appointment Rescheduled",
        message: `${
          initiator.name
        } has rescheduled the appointment to ${newAppointmentDateTime.toLocaleDateString()} at ${
          newAvailabilitySlot.startTime
        }.`,
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

export async function requestReschedule(
  appointmentId,
  requestedSlotId,
  requestedDate,
  reason
) {
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

    if (user.id !== appointment.patientId && user.id !== appointment.doctorId) {
      return { success: false, error: "Access denied" };
    }

    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 12) {
      return {
        success: false,
        error:
          "Cannot request rescheduling within 12 hours of the scheduled time",
      };
    }

    const requester =
      user.id === appointment.patientId
        ? appointment.patient
        : appointment.doctor;
    const requestee =
      user.id === appointment.patientId
        ? appointment.doctor
        : appointment.patient;

    await db.notification.create({
      data: {
        userId: requestee.id,
        type: "APPOINTMENT",
        title: "Reschedule Request",
        message: `${
          requester.name
        } has requested to reschedule the appointment. Reason: ${
          reason || "No reason provided"
        }`,
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
    return {
      success: false,
      error: "Failed to check appointment availability",
    };
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
        startTime: "asc",
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
      bookedAppointments.map((apt) => {
        const hours = apt.startTime.getHours().toString().padStart(2, "0");
        const minutes = apt.startTime.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      })
    );

    // Filter out booked slots and apply time restrictions
    const now = new Date();
    const isToday = targetDateTime.toDateString() === now.toDateString();

    const availableSlots = availabilitySlots.filter((slot) => {
      // Check if this exact start time is booked
      if (bookedTimes.has(slot.startTime)) {
        return false;
      }

      // For today's slots, check 12-hour minimum booking notice
      if (isToday) {
        const [hours, minutes] = slot.startTime.split(":").map(Number);
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

// PATIENT APPOINTMENT FUNCTIONS

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
      whereClause.OR = [{ startTime: { lt: now } }, { status: "COMPLETED" }];
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

    if (
      appointment.status === "COMPLETED" ||
      appointment.status === "CANCELLED"
    ) {
      return { success: false, error: "Cannot cancel this appointment" };
    }

    if (appointment.status === "IN_PROGRESS") {
      return {
        success: false,
        error: "Cannot cancel an appointment that is in progress",
      };
    }

    // Calculate refund based on NEW cancellation time policy
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    let refundCredits = 0;
    let refundReason = null;

    if (hoursUntilAppointment >= 24) {
      // Full refund if cancelled 24+ hours before
      refundCredits = 2;
      refundReason = "UNUSED_PACKAGE";
    } else if (hoursUntilAppointment >= 12) {
      // Partial refund if cancelled 12-24 hours before
      refundCredits = 1;
      refundReason = "LATE_CANCELLATION";
    }
    // No refund if cancelled less than 12 hours before

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

      // Calculate financial split for refund
      // For full refund: 100% to patient
      // For partial refund (late cancellation): 50% patient, 25% doctor, 25% platform
      let patientRefundAmount = 0;
      let doctorCompensation = 0;
      let platformFee = 0;

      if (refundCredits === 2) {
        // Full refund: 100% to patient
        patientRefundAmount = 2;
        doctorCompensation = 0;
        platformFee = 0;
      } else if (refundCredits === 1) {
        // Partial refund (50/25/25 split)
        patientRefundAmount = 1; // 50% of 2 credits
        doctorCompensation = 0.5; // 25% of 2 credits
        platformFee = 0.5; // 25% of 2 credits
      }

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
          patientRefundAmount: patientRefundAmount,
          doctorCompensation: doctorCompensation,
          platformFee: platformFee,
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
        message: `${patient.name} has cancelled their appointment. ${
          reason ? `Reason: ${reason}` : "No reason provided."
        }`,
        actionUrl: `/dashboard/appointments/${appointmentId}`,
        relatedId: appointmentId,
      },
    });

    revalidatePath("/appointments");
    revalidatePath(`/appointments/${appointmentId}`);

    return {
      success: true,
      appointment: updated,
      refundedCredits: refundCredits,
      message:
        refundCredits > 0
          ? `Appointment cancelled. ${refundCredits} credit${
              refundCredits > 1 ? "s" : ""
            } refunded.`
          : "Appointment cancelled. No refund due to late cancellation.",
    };
  } catch (error) {
    console.error("Failed to cancel appointment:", error);
    return { success: false, error: "Failed to cancel appointment" };
  }
}
