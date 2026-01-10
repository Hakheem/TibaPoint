"use server";

import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// DOCTOR EARNINGS FUNCTIONS
export async function getDoctorEarnings(filters = {}) {
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

    const { startDate, endDate, status } = filters;
    
    let whereClause = {
      doctorId: doctor.id,
      status: "COMPLETED",
    };

    if (startDate || endDate) {
      whereClause.completedAt = {};
      if (startDate) {
        whereClause.completedAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.completedAt.lte = new Date(endDate);
      }
    }

    // Get completed appointments with earnings
    const appointments = await db.appointment.findMany({
      where: whereClause,
      select: {
        id: true,
        startTime: true,
        completedAt: true,
        patient: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        doctorEarnings: true,
        platformEarnings: true,
        packagePrice: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Calculate totals
    const totalEarnings = appointments.reduce((sum, apt) => sum + (apt.doctorEarnings || 0), 0);
    const totalPlatformEarnings = appointments.reduce((sum, apt) => sum + (apt.platformEarnings || 0), 0);
    const totalConsultations = appointments.length;

    // Get pending earnings (not yet disbursed)
    const pendingEarnings = await calculatePendingEarnings(doctor.id);

    return {
      success: true,
      earnings: {
        totalEarnings: Math.round(totalEarnings),
        pendingEarnings: Math.round(pendingEarnings),
        totalPlatformEarnings: Math.round(totalPlatformEarnings),
        totalConsultations,
        recentAppointments: appointments.slice(0, 10),
        allAppointments: appointments,
      },
    };
  } catch (error) {
    console.error("Failed to fetch doctor earnings:", error);
    return { success: false, error: "Failed to fetch earnings" };
  }
}

async function calculatePendingEarnings(doctorId) {
  // Calculate earnings from completed appointments in the current payout period
  // Assuming weekly payouts on Monday
  
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7; // 0 = Monday, 1 = Tuesday, etc.
  
  const lastPayoutDate = new Date(now);
  lastPayoutDate.setDate(now.getDate() - daysSinceMonday);
  lastPayoutDate.setHours(0, 0, 0, 0);

  const appointments = await db.appointment.findMany({
    where: {
      doctorId: doctorId,
      status: "COMPLETED",
      completedAt: {
        gte: lastPayoutDate,
      },
    },
    select: {
      doctorEarnings: true,
    },
  });

  return appointments.reduce((sum, apt) => sum + (apt.doctorEarnings || 0), 0);
}

export async function requestWithdrawal(amount) {
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

    // Get pending earnings
    const pendingEarnings = await calculatePendingEarnings(doctor.id);
    const doctorBalance = doctor.creditBalance || 0;

    // Check minimum withdrawal amount (1000 KSH)
    if (amount < 1000) {
      return { success: false, error: "Minimum withdrawal amount is 1000 KSH" };
    }

    // Check if doctor has sufficient balance
    const availableBalance = doctorBalance + pendingEarnings;
    if (amount > availableBalance) {
      return { 
        success: false, 
        error: `Insufficient balance. Available: ${Math.round(availableBalance)} KSH` 
      };
    }

    // Create withdrawal request
    // Note: You'll need to create a WithdrawalRequest model
    // For now, we'll create a notification for admin
    
    await db.notification.create({
      data: {
        userId: doctor.id, // Store for doctor's reference
        type: "SYSTEM",
        title: "Withdrawal Request",
        message: `Dr. ${doctor.name} has requested a withdrawal of ${amount} KSH.`,
        actionUrl: `/admin/withdrawals`,
        relatedId: doctor.id,
      },
    });

    return { 
      success: true, 
      message: "Withdrawal request submitted. It will be processed on the next payout date (Monday)." 
    };
  } catch (error) {
    console.error("Failed to request withdrawal:", error);
    return { success: false, error: "Failed to submit withdrawal request" };
  }
}

// ADMIN EARNINGS FUNCTIONS
export async function getPlatformEarnings(filters = {}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user is admin
    const admin = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const { startDate, endDate } = filters;
    
    let whereClause = {
      status: "COMPLETED",
    };

    if (startDate || endDate) {
      whereClause.completedAt = {};
      if (startDate) {
        whereClause.completedAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.completedAt.lte = new Date(endDate);
      }
    }

    // Get all completed appointments
    const appointments = await db.appointment.findMany({
      where: whereClause,
      select: {
        id: true,
        startTime: true,
        completedAt: true,
        patient: {
          select: {
            name: true,
          },
        },
        doctor: {
          select: {
            name: true,
            speciality: true,
          },
        },
        platformEarnings: true,
        doctorEarnings: true,
        packagePrice: true,
        creditsCharged: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Calculate totals
    const totalPlatformEarnings = appointments.reduce((sum, apt) => sum + (apt.platformEarnings || 0), 0);
    const totalDoctorEarnings = appointments.reduce((sum, apt) => sum + (apt.doctorEarnings || 0), 0);
    const totalRevenue = appointments.reduce((sum, apt) => sum + (apt.packagePrice || 0), 0);
    const totalConsultations = appointments.length;

    // Group by doctor for breakdown
    const earningsByDoctor = appointments.reduce((acc, apt) => {
      if (!acc[apt.doctor.id]) {
        acc[apt.doctor.id] = {
          doctorName: apt.doctor.name,
          doctorSpeciality: apt.doctor.speciality,
          totalEarnings: 0,
          consultations: 0,
        };
      }
      acc[apt.doctor.id].totalEarnings += apt.doctorEarnings || 0;
      acc[apt.doctor.id].consultations += 1;
      return acc;
    }, {});

    return {
      success: true,
      earnings: {
        totalPlatformEarnings: Math.round(totalPlatformEarnings),
        totalDoctorEarnings: Math.round(totalDoctorEarnings),
        totalRevenue: Math.round(totalRevenue),
        totalConsultations,
        appointments,
        earningsByDoctor: Object.values(earningsByDoctor),
      },
    };
  } catch (error) {
    console.error("Failed to fetch platform earnings:", error);
    return { success: false, error: "Failed to fetch platform earnings" };
  }
}


export async function processDoctorPayouts() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user is admin
    const admin = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    // Get all doctors with pending earnings
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        doctorStatus: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        creditBalance: true,
      },
    });

    const payoutResults = [];
    let totalPayout = 0; 

    // Calculate pending earnings for each doctor and process payout
    for (const doctor of doctors) {
      const pendingEarnings = await calculatePendingEarnings(doctor.id);
      
      if (pendingEarnings > 0) {
        // Update doctor's credit balance
        await db.user.update({
          where: { id: doctor.id },
          data: {
            creditBalance: {
              increment: pendingEarnings,
            },
          },
        });

        // Create notification
        await db.notification.create({
          data: {
            userId: doctor.id,
            type: "SYSTEM",
            title: "Weekly Payout Processed",
            message: `Your earnings of ${Math.round(pendingEarnings)} KSH have been added to your balance.`,
            actionUrl: `/dashboard/earnings`,
            relatedId: doctor.id,
          },
        });

        payoutResults.push({
          doctorId: doctor.id,
          doctorName: doctor.name,
          amount: Math.round(pendingEarnings),
          status: "PAID",
        });

        totalPayout += pendingEarnings; 
      }
    }

    return {
      success: true,
      message: `Processed payouts for ${payoutResults.length} doctors. Total: ${Math.round(totalPayout)} KSH`,
      results: payoutResults,
      totalPayout: Math.round(totalPayout),
    };
  } catch (error) {
    console.error("Failed to process payouts:", error);
    return { success: false, error: "Failed to process payouts" };
  }
}
 

// EARNINGS STATISTICS
export async function getEarningsStatistics(period = "month") {
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

    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    let whereClause = {
      status: "COMPLETED",
      completedAt: {
        gte: startDate,
      },
    };

    if (user.role === "DOCTOR") {
      whereClause.doctorId = user.id;
    } else if (user.role === "PATIENT") {
      whereClause.patientId = user.id;
    }
    // ADMIN can see all

    const appointments = await db.appointment.findMany({
      where: whereClause,
      select: {
        completedAt: true,
        doctorEarnings: true,
        platformEarnings: true,
        packagePrice: true,
        creditsCharged: true,
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    // Group by date for chart data
    const earningsByDate = {};
    const consultationsByDate = {};

    appointments.forEach(apt => {
      const date = apt.completedAt.toISOString().split('T')[0];
      
      if (!earningsByDate[date]) {
        earningsByDate[date] = 0;
        consultationsByDate[date] = 0;
      }
      
      if (user.role === "DOCTOR") {
        earningsByDate[date] += apt.doctorEarnings || 0;
      } else if (user.role === "ADMIN") {
        earningsByDate[date] += apt.platformEarnings || 0;
      }
      
      consultationsByDate[date] += 1;
    });

    const chartData = Object.keys(earningsByDate).map(date => ({
      date,
      earnings: Math.round(earningsByDate[date]),
      consultations: consultationsByDate[date],
    }));

    // Calculate totals
    const totalEarnings = appointments.reduce((sum, apt) => {
      if (user.role === "DOCTOR") {
        return sum + (apt.doctorEarnings || 0);
      } else if (user.role === "ADMIN") {
        return sum + (apt.platformEarnings || 0);
      }
      return sum;
    }, 0);

    const totalConsultations = appointments.length;
    const avgEarningsPerConsultation = totalConsultations > 0 ? totalEarnings / totalConsultations : 0;

    return {
      success: true,
      statistics: {
        period,
        totalEarnings: Math.round(totalEarnings),
        totalConsultations,
        avgEarningsPerConsultation: Math.round(avgEarningsPerConsultation),
        chartData,
        appointments: appointments.slice(0, 10), 
      },
    };
  } catch (error) {
    console.error("Failed to fetch earnings statistics:", error);
    return { success: false, error: "Failed to fetch statistics" };
  }
}

