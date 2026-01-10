"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// verify admin
async function verifyAdmin() {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    return user?.role === "ADMIN";
  } catch (error) {
    console.error("Failed to verify admin", error);
    return false;
  }
}

// DOCTOR MANAGEMENT
export async function verifyDoctor(doctorId, notes = "") {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const doctor = await db.user.update({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      data: {
        verificationStatus: "VERIFIED",
        doctorStatus: "ACTIVE",
        isAvailable: true,
      },
    });

    // Create notification for doctor
    await db.notification.create({
      data: {
        userId: doctorId,
        type: "VERIFICATION",
        title: "Verification Approved",
        message: `Your verification has been approved. ${notes}`,
        actionUrl: "/doctor",
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "VERIFY_DOCTOR",
        targetType: "user",
        targetId: doctorId,
        reason: notes,
      },
    });

    revalidatePath("/admin/doctors");
    return { success: true, message: "Doctor verified successfully" };
  } catch (error) {
    console.error("Failed to verify doctor:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectDoctor(doctorId, reason = "") {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const doctor = await db.user.update({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      data: {
        verificationStatus: "REJECTED",
        doctorStatus: "ACTIVE",
        isAvailable: false,
      },
    });

    // Create notification for doctor
    await db.notification.create({
      data: {
        userId: doctorId,
        type: "VERIFICATION",
        title: "Verification Rejected",
        message: `Your verification has been rejected. Reason: ${reason}`,
        actionUrl: "/doctor/verification",
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "REJECT_DOCTOR",
        targetType: "user",
        targetId: doctorId,
        reason,
      },
    });

    revalidatePath("/admin/doctors");
    return { success: true, message: "Doctor rejected successfully" };
  } catch (error) {
    console.error("Failed to reject doctor:", error);
    return { success: false, error: error.message };
  }
}

export async function suspendDoctor(doctorId, reason = "", suspensionDays = 7) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const suspensionEnd = new Date();
    suspensionEnd.setDate(suspensionEnd.getDate() + suspensionDays);

    const doctor = await db.user.update({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      data: {
        doctorStatus: "SUSPENDED",
        isAvailable: false,
        suspendedAt: new Date(),
        suspensionEndDate: suspensionEnd,
        suspensionReason: reason,
        suspendedBy: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
      },
    });

    // Cancel upcoming appointments
    const upcomingAppointments = await db.appointment.findMany({
      where: {
        doctorId,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        startTime: { gt: new Date() },
      },
    });

    for (const appointment of upcomingAppointments) {
      await db.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "CANCELLED",
          cancelledBy: "ADMIN",
          cancellationReason: `Doctor suspended: ${reason}`,
          cancelledAt: new Date(),
        },
      });

      // Refund credits to patient
      await db.user.update({
        where: { id: appointment.patientId },
        data: {
          credits: { increment: appointment.creditsCharged },
        },
      });

      await db.creditTransaction.create({
        data: {
          userId: appointment.patientId,
          amount: appointment.creditsCharged,
          type: "REFUND",
          description: `Appointment cancelled due to doctor suspension: ${reason}`,
          balanceBefore: 0, // Will calculate
          balanceAfter: 0, // Will calculate
          appointmentId: appointment.id,
        },
      });
    }

    // Create notification for doctor
    await db.notification.create({
      data: {
        userId: doctorId,
        type: "SYSTEM",
        title: "Account Suspended",
        message: `Your account has been suspended for ${suspensionDays} days. Reason: ${reason}`,
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "SUSPEND_DOCTOR",
        targetType: "user",
        targetId: doctorId,
        reason,
        metadata: { suspensionDays },
      },
    });

    revalidatePath("/admin/doctors");
    return { success: true, message: "Doctor suspended successfully" };
  } catch (error) {
    console.error("Failed to suspend doctor:", error);
    return { success: false, error: error.message };
  }
}

export async function unsuspendDoctor(doctorId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const doctor = await db.user.update({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      data: {
        doctorStatus: "ACTIVE",
        isAvailable: true,
        suspendedAt: null,
        suspensionEndDate: null,
        suspensionReason: null,
        suspendedBy: null,
      },
    });

    // Create notification for doctor
    await db.notification.create({
      data: {
        userId: doctorId,
        type: "SYSTEM",
        title: "Account Reinstated",
        message: "Your account suspension has been lifted.",
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "UNSUSPEND_DOCTOR",
        targetType: "user",
        targetId: doctorId,
      },
    });

    revalidatePath("/admin/doctors");
    return { success: true, message: "Doctor unsuspended successfully" };
  } catch (error) {
    console.error("Failed to unsuspend doctor:", error);
    return { success: false, error: error.message };
  }
}

export async function banDoctor(doctorId, reason = "") {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const doctor = await db.user.update({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      data: {
        doctorStatus: "BANNED",
        isAvailable: false,
        bannedAt: new Date(),
        banReason: reason,
        bannedBy: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
      },
    });

    // Cancel all upcoming appointments
    const upcomingAppointments = await db.appointment.findMany({
      where: {
        doctorId,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        startTime: { gt: new Date() },
      },
    });

    for (const appointment of upcomingAppointments) {
      await db.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "CANCELLED",
          cancelledBy: "ADMIN",
          cancellationReason: `Doctor banned: ${reason}`,
          cancelledAt: new Date(),
        },
      });

      // Refund credits to patient
      await db.user.update({
        where: { id: appointment.patientId },
        data: {
          credits: { increment: appointment.creditsCharged },
        },
      });

      await db.creditTransaction.create({
        data: {
          userId: appointment.patientId,
          amount: appointment.creditsCharged,
          type: "REFUND",
          description: `Appointment cancelled due to doctor ban: ${reason}`,
          balanceBefore: 0,
          balanceAfter: 0,
          appointmentId: appointment.id,
        },
      });
    }

    // Create notification for doctor
    await db.notification.create({
      data: {
        userId: doctorId,
        type: "SYSTEM",
        title: "Account Banned",
        message: `Your account has been permanently banned. Reason: ${reason}`,
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "BAN_DOCTOR",
        targetType: "user",
        targetId: doctorId,
        reason,
      },
    });

    revalidatePath("/admin/doctors");
    return { success: true, message: "Doctor banned successfully" };
  } catch (error) {
    console.error("Failed to ban doctor:", error);
    return { success: false, error: error.message };
  }
}

export async function unbanDoctor(doctorId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const doctor = await db.user.update({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      data: {
        doctorStatus: "ACTIVE",
        isAvailable: true,
        bannedAt: null,
        banReason: null,
        bannedBy: null,
      },
    });

    // Create notification for doctor
    await db.notification.create({
      data: {
        userId: doctorId,
        type: "SYSTEM",
        title: "Account Unbanned",
        message: "Your account ban has been lifted.",
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "UNBAN_DOCTOR",
        targetType: "user",
        targetId: doctorId,
      },
    });

    revalidatePath("/admin/doctors");
    return { success: true, message: "Doctor unbanned successfully" };
  } catch (error) {
    console.error("Failed to unban doctor:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDoctor(doctorId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const doctor = await db.user.update({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      data: {
        doctorStatus: "DELETED",
        isAvailable: false,
        deletedAt: new Date(),
        deletedBy: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "DELETE_DOCTOR",
        targetType: "user",
        targetId: doctorId,
      },
    });

    revalidatePath("/admin/doctors");
    return { success: true, message: "Doctor soft deleted successfully" };
  } catch (error) {
    console.error("Failed to delete doctor:", error);
    return { success: false, error: error.message };
  }
}

export async function restoreDoctor(doctorId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const doctor = await db.user.update({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      data: {
        doctorStatus: "ACTIVE",
        isAvailable: true,
        deletedAt: null,
        deletedBy: null,
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "RESTORE_DOCTOR",
        targetType: "user",
        targetId: doctorId,
      },
    });

    revalidatePath("/admin/doctors");
    return { success: true, message: "Doctor restored successfully" };
  } catch (error) {
    console.error("Failed to restore doctor:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDoctorProfile(doctorId, data) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const validFields = [
      "speciality",
      "experience",
      "bio",
      "consultationFee",
      "licenseNumber",
      "credentialUrl",
      "phone",
      "city",
      "country",
    ];

    const updateData = {};
    validFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    const doctor = await db.user.update({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      data: updateData,
    });

    // Create notification for doctor
    await db.notification.create({
      data: {
        userId: doctorId,
        type: "SYSTEM",
        title: "Profile Updated by Admin",
        message:
          "Your profile information has been updated by an administrator.",
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "UPDATE_DOCTOR_PROFILE",
        targetType: "user",
        targetId: doctorId,
        metadata: updateData,
      },
    });

    revalidatePath("/admin/doctors");
    return { success: true, message: "Doctor profile updated successfully" };
  } catch (error) {
    console.error("Failed to update doctor profile:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllDoctors(filters = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const where = { role: "DOCTOR" };

    if (filters.verificationStatus) {
      where.verificationStatus = filters.verificationStatus;
    }
    if (filters.doctorStatus) {
      where.doctorStatus = filters.doctorStatus;
    }
    if (filters.speciality) {
      where.speciality = filters.speciality;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { licenseNumber: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const doctors = await db.user.findMany({
      where,
      include: {
        appointmentsAsDoctor: {
          select: {
            id: true,
            status: true,
            startTime: true,
            creditsCharged: true,
            doctorEarnings: true,
          },
        },
        reviewsReceived: {
          select: {
            rating: true,
          },
        },
        penalties: {
          where: {
            status: "ACTIVE",
          },
        },
      },
      orderBy: filters.orderBy || { createdAt: "desc" },
      skip: filters.skip || 0,
      take: filters.take || 50,
    });

    return { success: true, doctors };
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
    return { success: false, error: error.message };
  }
}

export async function getPendingDoctors() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        creditPackages: false,
      },
    });
    return { success: true, doctors };
  } catch (error) {
    console.error("Failed to fetch pending doctors:", error);
    return { success: false, error: error.message };
  }
}

export async function getDoctorDetails(doctorId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
      },
      include: {
        appointmentsAsDoctor: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            startTime: "desc",
          },
          take: 20,
        },
        reviewsReceived: {
          include: {
            patient: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        availabilities: true,
        penalties: {
          orderBy: {
            createdAt: "desc",
          },
        },
        creditTransactions: {
          where: {
            type: { in: ["SPENT", "REFUND"] },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    // Calculate statistics
    const totalAppointments = await db.appointment.count({
      where: { doctorId },
    });

    const completedAppointments = await db.appointment.count({
      where: {
        doctorId,
        status: "COMPLETED",
      },
    });

    const totalEarnings = await db.appointment.aggregate({
      where: {
        doctorId,
        status: "COMPLETED",
      },
      _sum: {
        doctorEarnings: true,
      },
    });

    const averageRating = await db.review.aggregate({
      where: { doctorId },
      _avg: {
        rating: true,
      },
    });

    return {
      success: true,
      doctor: {
        ...doctor,
        stats: {
          totalAppointments,
          completedAppointments,
          totalEarnings: totalEarnings._sum.doctorEarnings || 0,
          averageRating: averageRating._avg.rating || 0,
          completionRate:
            totalAppointments > 0
              ? (completedAppointments / totalAppointments) * 100
              : 0,
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch doctor details:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// PATIENT MANAGEMENT
// ============================================

export async function getAllPatients(filters = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const where = { role: "PATIENT" };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const patients = await db.user.findMany({
      where,
      include: {
        appointmentsAsPatient: {
          select: {
            id: true,
            status: true,
            startTime: true,
            doctor: {
              select: {
                name: true,
                speciality: true,
              },
            },
          },
          orderBy: {
            startTime: "desc",
          },
          take: 5,
        },
        creditPackages: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            purchasedAt: "desc",
          },
          take: 1,
        },
        familyMembers: {
          include: {
            member: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: filters.orderBy || { createdAt: "desc" },
      skip: filters.skip || 0,
      take: filters.take || 50,
    });

    return { success: true, patients };
  } catch (error) {
    console.error("Failed to fetch patients:", error);
    return { success: false, error: error.message };
  }
}

export async function getPatientDetails(patientId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const patient = await db.user.findUnique({
      where: {
        id: patientId,
        role: "PATIENT",
      },
      include: {
        appointmentsAsPatient: {
          include: {
            doctor: {
              select: {
                name: true,
                speciality: true,
                rating: true,
              },
            },
            review: {
              select: {
                rating: true,
                comment: true,
              },
            },
          },
          orderBy: {
            startTime: "desc",
          },
        },
        creditPackages: {
          orderBy: {
            purchasedAt: "desc",
          },
        },
        creditTransactions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
        familyMembers: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        familyMemberOf: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        refunds: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    // Calculate statistics
    const totalAppointments = await db.appointment.count({
      where: { patientId },
    });

    const completedAppointments = await db.appointment.count({
      where: {
        patientId,
        status: "COMPLETED",
      },
    });

    const totalSpent = await db.appointment.aggregate({
      where: {
        patientId,
        status: { in: ["COMPLETED", "CANCELLED"] },
      },
      _sum: {
        creditsCharged: true,
      },
    });

    return {
      success: true,
      patient: {
        ...patient,
        stats: {
          totalAppointments,
          completedAppointments,
          totalSpent: totalSpent._sum.creditsCharged || 0,
          completionRate:
            totalAppointments > 0
              ? (completedAppointments / totalAppointments) * 100
              : 0,
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch patient details:", error);
    return { success: false, error: error.message };
  }
}

export async function suspendPatient(patientId, reason = "") {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    await db.user.update({
      where: {
        id: patientId,
        role: "PATIENT",
      },
      data: {
        suspendedAt: new Date(),
        suspensionReason: reason,
        suspendedBy: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
      },
    });

    // Cancel upcoming appointments
    const upcomingAppointments = await db.appointment.findMany({
      where: {
        patientId,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        startTime: { gt: new Date() },
      },
    });

    for (const appointment of upcomingAppointments) {
      await db.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "CANCELLED",
          cancelledBy: "ADMIN",
          cancellationReason: `Patient suspended: ${reason}`,
          cancelledAt: new Date(),
        },
      });
    }

    // Create notification for patient
    await db.notification.create({
      data: {
        userId: patientId,
        type: "SYSTEM",
        title: "Account Suspended",
        message: `Your account has been suspended. Reason: ${reason}`,
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "SUSPEND_PATIENT",
        targetType: "user",
        targetId: patientId,
        reason,
      },
    });

    revalidatePath("/admin/patients");
    return { success: true, message: "Patient suspended successfully" };
  } catch (error) {
    console.error("Failed to suspend patient:", error);
    return { success: false, error: error.message };
  }
}

export async function unsuspendPatient(patientId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    await db.user.update({
      where: {
        id: patientId,
        role: "PATIENT",
      },
      data: {
        suspendedAt: null,
        suspensionReason: null,
        suspendedBy: null,
      },
    });

    // Create notification for patient
    await db.notification.create({
      data: {
        userId: patientId,
        type: "SYSTEM",
        title: "Account Reinstated",
        message: "Your account suspension has been lifted.",
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "UNSUSPEND_PATIENT",
        targetType: "user",
        targetId: patientId,
      },
    });

    revalidatePath("/admin/patients");
    return { success: true, message: "Patient unsuspended successfully" };
  } catch (error) {
    console.error("Failed to unsuspend patient:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePatient(patientId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    // Soft delete - set deletedAt timestamp
    await db.user.update({
      where: {
        id: patientId,
        role: "PATIENT",
      },
      data: {
        deletedAt: new Date(),
        deletedBy: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
      },
    });

    // Cancel upcoming appointments
    const upcomingAppointments = await db.appointment.findMany({
      where: {
        patientId,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        startTime: { gt: new Date() },
      },
    });

    for (const appointment of upcomingAppointments) {
      await db.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "CANCELLED",
          cancelledBy: "ADMIN",
          cancellationReason: "Patient account deleted",
          cancelledAt: new Date(),
        },
      });
    }

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "DELETE_PATIENT",
        targetType: "user",
        targetId: patientId,
      },
    });

    revalidatePath("/admin/patients");
    return { success: true, message: "Patient deleted successfully" };
  } catch (error) {
    console.error("Failed to delete patient:", error);
    return { success: false, error: error.message };
  }
}

export async function restorePatient(patientId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    await db.user.update({
      where: {
        id: patientId,
        role: "PATIENT",
      },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "RESTORE_PATIENT",
        targetType: "user",
        targetId: patientId,
      },
    });

    revalidatePath("/admin/patients");
    return { success: true, message: "Patient restored successfully" };
  } catch (error) {
    console.error("Failed to restore patient:", error);
    return { success: false, error: error.message };
  }
}

export async function adjustPatientCredits(patientId, amount, reason = "") {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    // Get current balance
    const patient = await db.user.findUnique({
      where: { id: patientId },
      select: { credits: true },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    const newBalance = patient.credits + amount;

    // Update patient credits
    await db.user.update({
      where: { id: patientId },
      data: {
        credits: newBalance,
      },
    });

    // Create transaction record
    await db.creditTransaction.create({
      data: {
        userId: patientId,
        amount,
        type: amount > 0 ? "BONUS" : "PENALTY",
        description: `Admin adjustment: ${reason}`,
        balanceBefore: patient.credits,
        balanceAfter: newBalance,
      },
    });

    // Create notification for patient
    await db.notification.create({
      data: {
        userId: patientId,
        type: "SYSTEM",
        title: amount > 0 ? "Credits Added" : "Credits Deducted",
        message: `Your account has been ${
          amount > 0 ? "credited" : "debited"
        } with ${Math.abs(amount)} credits. ${reason}`,
      },
    });

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "ADJUST_PATIENT_CREDITS",
        targetType: "user",
        targetId: patientId,
        reason,
        metadata: { amount, previousBalance: patient.credits, newBalance },
      },
    });

    revalidatePath("/admin/patients");
    return {
      success: true,
      message: `Successfully ${amount > 0 ? "added" : "deducted"} ${Math.abs(
        amount
      )} credits`,
      newBalance,
    };
  } catch (error) {
    console.error("Failed to adjust patient credits:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// APPOINTMENT MANAGEMENT
// ============================================

export async function getAllAppointments(filters = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.startTime = {};
      if (filters.dateFrom) {
        where.startTime.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.startTime.lte = new Date(filters.dateTo);
      }
    }
    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }
    if (filters.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters.search) {
      where.OR = [
        {
          patient: {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
            ],
          },
        },
        {
          doctor: {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            speciality: true,
            verificationStatus: true,
          },
        },
        review: {
          select: {
            rating: true,
            comment: true,
          },
        },
        refund: {
          select: {
            status: true,
            refundedCredits: true,
          },
        },
      },
      orderBy: filters.orderBy || { startTime: "desc" },
      skip: filters.skip || 0,
      take: filters.take || 50,
    });

    return { success: true, appointments };
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return { success: false, error: error.message };
  }
}

export async function getAppointmentDetails(appointmentId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            speciality: true,
            experience: true,
            rating: true,
            verificationStatus: true,
          },
        },
        review: true,
        refund: true,
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    return { success: true, appointment };
  } catch (error) {
    console.error("Failed to fetch appointment details:", error);
    return { success: false, error: error.message };
  }
}

export async function cancelAppointment(appointmentId, reason = "") {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            credits: true,
          },
        },
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    // Update appointment status
    await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        cancelledBy: "ADMIN",
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    });

    // Refund credits to patient
    const refundedCredits =
      appointment.creditsCharged - appointment.creditsRefunded;
    if (refundedCredits > 0) {
      await db.user.update({
        where: { id: appointment.patientId },
        data: {
          credits: { increment: refundedCredits },
        },
      });

      await db.creditTransaction.create({
        data: {
          userId: appointment.patientId,
          amount: refundedCredits,
          type: "REFUND",
          description: `Appointment cancelled by admin: ${reason}`,
          balanceBefore: appointment.patient.credits,
          balanceAfter: appointment.patient.credits + refundedCredits,
          appointmentId: appointmentId,
        },
      });
    }

    // Create notifications
    await Promise.all([
      db.notification.create({
        data: {
          userId: appointment.patientId,
          type: "APPOINTMENT",
          title: "Appointment Cancelled",
          message: `Your appointment has been cancelled by admin. Reason: ${reason}`,
          actionUrl: `/appointments/${appointmentId}`,
        },
      }),
      db.notification.create({
        data: {
          userId: appointment.doctorId,
          type: "APPOINTMENT",
          title: "Appointment Cancelled",
          message: `Your appointment has been cancelled by admin. Reason: ${reason}`,
          actionUrl: `/doctor/appointments/${appointmentId}`,
        },
      }),
    ]);

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "CANCEL_APPOINTMENT",
        targetType: "appointment",
        targetId: appointmentId,
        reason,
        metadata: { refundedCredits },
      },
    });

    revalidatePath("/admin/appointments");
    return { success: true, message: "Appointment cancelled successfully" };
  } catch (error) {
    console.error("Failed to cancel appointment:", error);
    return { success: false, error: error.message };
  }
}

export async function rescheduleAppointment(appointmentId, newStartTime) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const newStart = new Date(newStartTime);
    const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000); // Assuming 1 hour appointments

    await db.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime: newStart,
        endTime: newEnd,
        updatedAt: new Date(),
      },
    });

    // Create notifications
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      select: { patientId: true, doctorId: true },
    });

    await Promise.all([
      db.notification.create({
        data: {
          userId: appointment.patientId,
          type: "APPOINTMENT",
          title: "Appointment Rescheduled",
          message: `Your appointment has been rescheduled to ${newStart.toLocaleString()}`,
          actionUrl: `/appointments/${appointmentId}`,
        },
      }),
      db.notification.create({
        data: {
          userId: appointment.doctorId,
          type: "APPOINTMENT",
          title: "Appointment Rescheduled",
          message: `Your appointment has been rescheduled to ${newStart.toLocaleString()}`,
          actionUrl: `/doctor/appointments/${appointmentId}`,
        },
      }),
    ]);

    // Create admin log
    await db.adminLog.create({
      data: {
        adminId: (
          await db.user.findUnique({
            where: { clerkUserId: (await auth()).userId },
          })
        ).id,
        action: "RESCHEDULE_APPOINTMENT",
        targetType: "appointment",
        targetId: appointmentId,
        metadata: { newStartTime: newStart },
      },
    });

    revalidatePath("/admin/appointments");
    return { success: true, message: "Appointment rescheduled successfully" };
  } catch (error) {
    console.error("Failed to reschedule appointment:", error);
    return { success: false, error: error.message };
  }
}

export async function getUpcomingAppointments() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const appointments = await db.appointment.findMany({
      where: {
        startTime: { gt: new Date() },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      include: {
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
        doctor: {
          select: {
            name: true,
            speciality: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
      take: 20,
    });

    return { success: true, appointments };
  } catch (error) {
    console.error("Failed to fetch upcoming appointments:", error);
    return { success: false, error: error.message };
  }
}

export async function getPastAppointments(dateRange = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const where = {
      startTime: { lt: new Date() },
      status: { in: ["COMPLETED", "CANCELLED"] },
    };

    if (dateRange.start) {
      where.startTime.gte = new Date(dateRange.start);
    }
    if (dateRange.end) {
      where.startTime.lte = new Date(dateRange.end);
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
        doctor: {
          select: {
            name: true,
            speciality: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
      take: 50,
    });

    return { success: true, appointments };
  } catch (error) {
    console.error("Failed to fetch past appointments:", error);
    return { success: false, error: error.message };
  }
}

export async function getNoShowAppointments() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const appointments = await db.appointment.findMany({
      where: {
        status: "NO_SHOW",
        startTime: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      },
      include: {
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
        doctor: {
          select: {
            name: true,
            speciality: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    return { success: true, appointments };
  } catch (error) {
    console.error("Failed to fetch no-show appointments:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ANALYTICS & REPORTS
// ============================================

export async function getDashboardStats() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total counts
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalRevenue,
      pendingDoctors,
      pendingRefunds,
      activeAppointments,
      recentSignups,
    ] = await Promise.all([
      db.user.count({ where: { role: "PATIENT" } }),
      db.user.count({ where: { role: "DOCTOR" } }),
      db.appointment.count(),
      db.appointment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { platformEarnings: true },
      }),
      db.user.count({
        where: { role: "DOCTOR", verificationStatus: "PENDING" },
      }),
      db.refund.count({ where: { status: "PENDING" } }),
      db.appointment.count({
        where: { status: { in: ["SCHEDULED", "CONFIRMED"] } },
      }),
      db.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // Monthly revenue
    const monthlyRevenue = await db.appointment.aggregate({
      where: {
        status: "COMPLETED",
        startTime: { gte: startOfMonth },
      },
      _sum: {
        platformEarnings: true,
        doctorEarnings: true,
      },
    });

    // Yearly revenue
    const yearlyRevenue = await db.appointment.aggregate({
      where: {
        status: "COMPLETED",
        startTime: { gte: startOfYear },
      },
      _sum: {
        platformEarnings: true,
        doctorEarnings: true,
      },
    });

    return {
      success: true,
      stats: {
        totals: {
          patients: totalPatients,
          doctors: totalDoctors,
          appointments: totalAppointments,
          revenue: totalRevenue._sum.platformEarnings || 0,
        },
        pending: {
          doctors: pendingDoctors,
          refunds: pendingRefunds,
        },
        current: {
          activeAppointments,
          recentSignups,
        },
        revenue: {
          monthly: {
            platform: monthlyRevenue._sum.platformEarnings || 0,
            doctor: monthlyRevenue._sum.doctorEarnings || 0,
            total:
              (monthlyRevenue._sum.platformEarnings || 0) +
              (monthlyRevenue._sum.doctorEarnings || 0),
          },
          yearly: {
            platform: yearlyRevenue._sum.platformEarnings || 0,
            doctor: yearlyRevenue._sum.doctorEarnings || 0,
            total:
              (yearlyRevenue._sum.platformEarnings || 0) +
              (yearlyRevenue._sum.doctorEarnings || 0),
          },
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserGrowth(dateRange = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const where = {};
    if (dateRange.start) {
      where.createdAt = { gte: new Date(dateRange.start) };
    }
    if (dateRange.end) {
      where.createdAt = { ...where.createdAt, lte: new Date(dateRange.end) };
    }

    // Get patient growth
    const patients = await db.user.findMany({
      where: { ...where, role: "PATIENT" },
      select: { createdAt: true },
    });

    // Get doctor growth
    const doctors = await db.user.findMany({
      where: { ...where, role: "DOCTOR" },
      select: { createdAt: true },
    });

    // Process into monthly data
    const processGrowthData = (users) => {
      const monthlyData = {};

      users.forEach((user) => {
        const month = user.createdAt.toISOString().slice(0, 7); // YYYY-MM format
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });

      return Object.entries(monthlyData)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));
    };

    return {
      success: true,
      growthData: {
        patients: processGrowthData(patients),
        doctors: processGrowthData(doctors),
        total: processGrowthData([...patients, ...doctors]),
      },
    };
  } catch (error) {
    console.error("Failed to fetch user growth:", error);
    return { success: false, error: error.message };
  }
}

export async function getAppointmentStats(dateRange = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const where = {};
    if (dateRange.start) {
      where.startTime = { gte: new Date(dateRange.start) };
    }
    if (dateRange.end) {
      where.startTime = { ...where.startTime, lte: new Date(dateRange.end) };
    }

    const appointments = await db.appointment.findMany({
      where,
      select: {
        status: true,
        startTime: true,
        creditsCharged: true,
        platformEarnings: true,
        doctorEarnings: true,
      },
    });

    // Calculate statistics
    const total = appointments.length;
    const completed = appointments.filter(
      (a) => a.status === "COMPLETED"
    ).length;
    const cancelled = appointments.filter(
      (a) => a.status === "CANCELLED"
    ).length;
    const noShow = appointments.filter((a) => a.status === "NO_SHOW").length;

    const totalRevenue = appointments
      .filter((a) => a.status === "COMPLETED")
      .reduce((sum, a) => sum + (a.platformEarnings || 0), 0);

    const doctorEarnings = appointments
      .filter((a) => a.status === "COMPLETED")
      .reduce((sum, a) => sum + (a.doctorEarnings || 0), 0);

    const totalCredits = appointments
      .filter((a) => a.status === "COMPLETED")
      .reduce((sum, a) => sum + (a.creditsCharged || 0), 0);

    // Monthly breakdown
    const monthlyData = {};
    appointments.forEach((appointment) => {
      const month = appointment.startTime.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = {
          appointments: 0,
          revenue: 0,
          credits: 0,
        };
      }
      monthlyData[month].appointments++;
      if (appointment.status === "COMPLETED") {
        monthlyData[month].revenue += appointment.platformEarnings || 0;
        monthlyData[month].credits += appointment.creditsCharged || 0;
      }
    });

    const monthlyBreakdown = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      success: true,
      stats: {
        total,
        completed,
        cancelled,
        noShow,
        totalRevenue,
        doctorEarnings,
        totalCredits,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
        noShowRate: total > 0 ? (noShow / total) * 100 : 0,
      },
      monthlyBreakdown,
    };
  } catch (error) {
    console.error("Failed to fetch appointment stats:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// REFUND MANAGEMENT
// ============================================

export async function getAllRefunds(filters = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.appointmentId) where.appointmentId = filters.appointmentId;

    const refunds = await db.refund.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        appointment: {
          select: {
            id: true,
            startTime: true,
            doctorId: true,
            patientId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters.take || 50,
    });

    return { success: true, refunds };
  } catch (error) {
    console.error("Failed to fetch refunds:", error);
    return { success: false, error: error.message };
  }
}

export async function approveRefund(refundId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const refund = await db.refund.findUnique({
      where: { id: refundId },
      include: { user: true, appointment: true },
    });
    if (!refund) return { success: false, error: "Refund not found" };
    if (refund.status !== "PENDING")
      return { success: false, error: "Refund already processed" };

    // Process refund: increment user credits
    if (refund.refundedCredits > 0) {
      await db.user.update({
        where: { id: refund.userId },
        data: { credits: { increment: refund.refundedCredits } },
      });

      await db.creditTransaction.create({
        data: {
          userId: refund.userId,
          amount: refund.refundedCredits,
          type: "REFUND",
          description: `Refund processed for appointment ${refund.appointmentId}`,
          balanceBefore: 0,
          balanceAfter: 0,
          appointmentId: refund.appointmentId,
        },
      });

      // Update appointment refunded credits if applicable
      if (refund.appointmentId) {
        await db.appointment.update({
          where: { id: refund.appointmentId },
          data: { creditsRefunded: { increment: refund.refundedCredits } },
        });
      }
    }

    const adminUser = await db.user.findUnique({
      where: { clerkUserId: (await auth()).userId },
    });

    await db.refund.update({
      where: { id: refundId },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        processedBy: adminUser?.id,
      },
    });

    // Notify user
    await db.notification.create({
      data: {
        userId: refund.userId,
        type: "REFUND",
        title: "Refund Processed",
        message: `Your refund request for appointment ${refund.appointmentId} has been processed.`,
      },
    });

    // Admin log
    await db.adminLog.create({
      data: {
        adminId: adminUser?.id,
        action: "APPROVE_REFUND",
        targetType: "refund",
        targetId: refundId,
      },
    });

    revalidatePath("/admin/refunds");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve refund:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectRefund(refundId, notes = "") {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const refund = await db.refund.findUnique({
      where: { id: refundId },
      include: { user: true },
    });
    if (!refund) return { success: false, error: "Refund not found" };
    if (refund.status !== "PENDING")
      return { success: false, error: "Refund already processed" };

    const adminUser = await db.user.findUnique({
      where: { clerkUserId: (await auth()).userId },
    });

    await db.refund.update({
      where: { id: refundId },
      data: {
        status: "REJECTED",
        adminNotes: notes,
        processedAt: new Date(),
        processedBy: adminUser?.id,
      },
    });

    await db.notification.create({
      data: {
        userId: refund.userId,
        type: "REFUND",
        title: "Refund Rejected",
        message: `Your refund request for appointment ${refund.appointmentId} was rejected. Reason: ${notes}`,
      },
    });

    await db.adminLog.create({
      data: {
        adminId: adminUser?.id,
        action: "REJECT_REFUND",
        targetType: "refund",
        targetId: refundId,
        reason: notes,
      },
    });

    revalidatePath("/admin/refunds");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject refund:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// PENALTY MANAGEMENT
// ============================================

export async function getAllPenalties(filters = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.doctorId) where.doctorId = filters.doctorId;

    const penalties = await db.penalty.findMany({
      where,
      include: { doctor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: filters.take || 50,
    });

    return { success: true, penalties };
  } catch (error) {
    console.error("Failed to fetch penalties:", error);
    return { success: false, error: error.message };
  }
}

export async function createPenalty(
  doctorId,
  type,
  creditsDeducted = 1,
  amountDeducted = 0.0,
  reason = "",
  appointmentId = null
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const adminUser = await db.user.findUnique({
      where: { clerkUserId: (await auth()).userId },
    });

    const penalty = await db.penalty.create({
      data: {
        doctorId,
        appointmentId,
        type,
        creditsDeducted,
        amountDeducted,
        reason,
        issuedBy: adminUser?.id,
      },
    });

    // Notify doctor
    await db.notification.create({
      data: {
        userId: doctorId,
        type: "PENALTY",
        title: "Penalty Issued",
        message: `A penalty was issued: ${reason}`,
      },
    });

    await db.adminLog.create({
      data: {
        adminId: adminUser?.id,
        action: "CREATE_PENALTY",
        targetType: "user",
        targetId: doctorId,
        metadata: { penaltyId: penalty.id },
      },
    });

    revalidatePath("/admin/penalties");
    return { success: true, penalty };
  } catch (error) {
    console.error("Failed to create penalty:", error);
    return { success: false, error: error.message };
  }
}

export async function resolvePenalty(penaltyId, notes = "") {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const adminUser = await db.user.findUnique({
      where: { clerkUserId: (await auth()).userId },
    });

    await db.penalty.update({
      where: { id: penaltyId },
      data: {
        status: "RESOLVED",
        resolvedBy: adminUser?.id,
        resolvedAt: new Date(),
        appealNotes: notes,
      },
    });

    await db.adminLog.create({
      data: {
        adminId: adminUser?.id,
        action: "RESOLVE_PENALTY",
        targetType: "penalty",
        targetId: penaltyId,
        reason: notes,
      },
    });

    revalidatePath("/admin/penalties");
    return { success: true };
  } catch (error) {
    console.error("Failed to resolve penalty:", error);
    return { success: false, error: error.message };
  }
}

export async function getPopularSpecialties() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const appointments = await db.appointment.findMany({
      where: {
        status: "COMPLETED",
        startTime: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      },
      include: {
        doctor: {
          select: {
            speciality: true,
          },
        },
      },
    });

    // Count specialties
    const specialtyCount = {};
    appointments.forEach((appointment) => {
      const specialty = appointment.doctor.speciality;
      if (specialty) {
        specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
      }
    });

    // Convert to array and sort
    const popularSpecialties = Object.entries(specialtyCount)
      .map(([specialty, count]) => ({ specialty, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    return {
      success: true,
      popularSpecialties,
    };
  } catch (error) {
    console.error("Failed to fetch popular specialties:", error);
    return { success: false, error: error.message };
  }
}
