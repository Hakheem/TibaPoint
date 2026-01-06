"use server";

import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server' 
import { revalidatePath } from 'next/cache'

// ============================================
// APPOINTMENT FUNCTIONS (Auth Required)
// ============================================

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
      where: { 
        id: appointmentId,
        doctorId: doctor.id,
      },
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
  } catch (Error) {
    console.error("Failed to cancel appointment:", error);
    return { success: false, error: "Failed to cancel appointment" };
  }
}

