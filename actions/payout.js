"use server";

import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// ============================================
// DOCTOR PAYOUT FUNCTIONS
// ============================================

/**
 * Get doctor's available balance for withdrawal
 */
export async function getDoctorBalance() {
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
      select: {
        id: true,
        name: true,
        email: true,
        creditBalance: true,
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    // Get pending payouts
    const pendingPayouts = await db.payout.findMany({
      where: {
        doctorId: doctor.id,
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
      select: {
        amount: true,
      },
    });

    const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
    const availableBalance = (doctor.creditBalance || 0) - pendingAmount;

    return {
      success: true,
      balance: {
        totalBalance: doctor.creditBalance || 0,
        pendingAmount,
        availableBalance: Math.max(0, availableBalance),
      },
    };
  } catch (error) {
    console.error("Failed to fetch doctor balance:", error);
    return { success: false, error: "Failed to fetch balance" };
  }
}

/**
 * Request a new payout
 */
export async function requestPayout(data) {
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

    // Validate amount
    if (data.amount < 1000) {
      return { success: false, error: "Minimum payout amount is KSH 1,000" };
    }

    // Validate payment method details
    if (data.payoutMethod === "TILL_NUMBER" && !data.tillNumber) {
      return { success: false, error: "Till number is required" };
    }

    if ((data.payoutMethod === "MPESA" || data.payoutMethod === "AIRTEL_MONEY") && !data.phoneNumber) {
      return { success: false, error: "Phone number is required" };
    }

    // Validate phone number format (Kenyan format)
    if (data.phoneNumber) {
      const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
      if (!phoneRegex.test(data.phoneNumber)) {
        return { success: false, error: "Invalid phone number format. Use format: 0712345678 or +254712345678" };
      }
    }

    // Check details confirmation
    if (!data.detailsConfirmed) {
      return { success: false, error: "Please confirm that your details are correct" };
    }

    // Check available balance
    const balanceResult = await getDoctorBalance();
    if (!balanceResult.success) {
      return balanceResult;
    }

    const availableBalance = balanceResult.balance?.availableBalance || 0;

    if (data.amount > availableBalance) {
      return {
        success: false,
        error: `Insufficient balance. Available: KSH ${availableBalance.toFixed(2)}`,
      };
    }

    // Create payout request
    const payout = await db.payout.create({
      data: {
        doctorId: doctor.id,
        amount: data.amount,
        payoutMethod: data.payoutMethod,
        recipientName: data.recipientName,
        phoneNumber: data.phoneNumber || null,
        tillNumber: data.tillNumber || null,
        balanceBefore: doctor.creditBalance || 0,
        balanceAfter: (doctor.creditBalance || 0) - data.amount,
        detailsConfirmed: data.detailsConfirmed,
        confirmedAt: new Date(),
        doctorNotes: data.doctorNotes || null,
        status: "PENDING",
      },
    });

    // Create notification for doctor
    await db.notification.create({
      data: {
        userId: doctor.id,
        type: "SYSTEM",
        title: "Payout Request Submitted",
        message: `Your payout request for KSH ${data.amount.toFixed(2)} has been submitted and is pending admin approval.`,
        actionUrl: `/dashboard/payouts/${payout.id}`,
        relatedId: payout.id,
      },
    });

    // Create notification for admins
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    await Promise.all(
      admins.map(admin =>
        db.notification.create({
          data: {
            userId: admin.id,
            type: "SYSTEM",
            title: "New Payout Request",
            message: `Dr. ${doctor.name} has requested a payout of KSH ${data.amount.toFixed(2)} via ${data.payoutMethod}.`,
            actionUrl: `/admin/payouts/${payout.id}`,
            relatedId: payout.id,
          },
        })
      )
    );

    revalidatePath('/dashboard/payouts');

    return {
      success: true,
      message: "Payout request submitted successfully",
      payout: {
        id: payout.id,
        amount: payout.amount,
        status: payout.status,
      },
    };
  } catch (error) {
    console.error("Failed to request payout:", error);
    return { success: false, error: "Failed to submit payout request" };
  }
}

/**
 * Get doctor's payout history
 */
export async function getDoctorPayouts(filters = {}) {
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

    const whereClause = {
      doctorId: doctor.id,
    };

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = filters.endDate;
      }
    }

    const payouts = await db.payout.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate statistics
    const totalPaid = payouts
      .filter(p => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payouts
      .filter(p => p.status === "PENDING" || p.status === "PROCESSING")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      success: true,
      payouts,
      statistics: {
        totalPaid,
        totalPending,
        totalRequests: payouts.length,
      },
    };
  } catch (error) {
    console.error("Failed to fetch doctor payouts:", error);
    return { success: false, error: "Failed to fetch payouts" };
  }
}

/**
 * Cancel a pending payout request
 */
export async function cancelPayoutRequest(payoutId, reason = null) {
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

    // Get payout
    const payout = await db.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      return { success: false, error: "Payout not found" };
    }

    if (payout.doctorId !== doctor.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (payout.status !== "PENDING") {
      return {
        success: false,
        error: "Only pending payout requests can be cancelled",
      };
    }

    // Update payout status
    await db.payout.update({
      where: { id: payoutId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: doctor.id,
        cancellationReason: reason,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: doctor.id,
        type: "SYSTEM",
        title: "Payout Request Cancelled",
        message: `Your payout request for KSH ${payout.amount.toFixed(2)} has been cancelled.`,
        actionUrl: `/dashboard/payouts/${payoutId}`,
        relatedId: payoutId,
      },
    });

    revalidatePath('/dashboard/payouts');

    return {
      success: true,
      message: "Payout request cancelled successfully",
    };
  } catch (error) {
    console.error("Failed to cancel payout:", error);
    return { success: false, error: "Failed to cancel payout request" };
  }
}

// ============================================
// ADMIN PAYOUT FUNCTIONS
// ============================================

/**
 * Get all payout requests (Admin only)
 */
export async function getAllPayouts(filters = {}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const admin = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const whereClause = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.doctorId) {
      whereClause.doctorId = filters.doctorId;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = filters.endDate;
      }
    }

    const payouts = await db.payout.findMany({
      where: whereClause,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            speciality: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate statistics
    const statistics = {
      totalPending: payouts.filter(p => p.status === "PENDING").length,
      totalProcessing: payouts.filter(p => p.status === "PROCESSING").length,
      totalCompleted: payouts.filter(p => p.status === "COMPLETED").length,
      totalFailed: payouts.filter(p => p.status === "FAILED").length,
      totalCancelled: payouts.filter(p => p.status === "CANCELLED").length,
      totalAmount: payouts
        .filter(p => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payouts
        .filter(p => p.status === "PENDING" || p.status === "PROCESSING")
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return {
      success: true,
      payouts,
      statistics,
    };
  } catch (error) {
    console.error("Failed to fetch payouts:", error);
    return { success: false, error: "Failed to fetch payouts" };
  }
}

/**
 * Update payout status to processing (Admin only)
 */
export async function markPayoutAsProcessing(payoutId, adminNotes = null) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const admin = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const payout = await db.payout.findUnique({
      where: { id: payoutId },
      include: { doctor: true },
    });

    if (!payout) {
      return { success: false, error: "Payout not found" };
    }

    if (payout.status !== "PENDING") {
      return {
        success: false,
        error: "Only pending payouts can be marked as processing",
      };
    }

    // Update payout
    await db.payout.update({
      where: { id: payoutId },
      data: {
        status: "PROCESSING",
        processedBy: admin.id,
        adminNotes,
      },
    });

    // Notify doctor
    await db.notification.create({
      data: {
        userId: payout.doctorId,
        type: "SYSTEM",
        title: "Payout Being Processed",
        message: `Your payout request for KSH ${payout.amount.toFixed(2)} is now being processed.`,
        actionUrl: `/dashboard/payouts/${payoutId}`,
        relatedId: payoutId,
      },
    });

    revalidatePath('/admin/payouts');

    return {
      success: true,
      message: "Payout marked as processing",
    };
  } catch (error) {
    console.error("Failed to update payout:", error);
    return { success: false, error: "Failed to update payout" };
  }
}

/**
 * Complete a payout (Admin only)
 */
export async function completePayoutRequest(data) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const admin = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const payout = await db.payout.findUnique({
      where: { id: data.payoutId },
      include: { doctor: true },
    });

    if (!payout) {
      return { success: false, error: "Payout not found" };
    }

    if (payout.status === "COMPLETED") {
      return { success: false, error: "Payout already completed" };
    }

    if (payout.status === "CANCELLED") {
      return { success: false, error: "Cannot complete a cancelled payout" };
    }

    // Update payout and doctor balance in a transaction
    await db.$transaction([
      // Update payout
      db.payout.update({
        where: { id: data.payoutId },
        data: {
          status: "COMPLETED",
          processedBy: admin.id,
          processedAt: new Date(),
          transactionRef: data.transactionRef,
          adminNotes: data.adminNotes || null,
        },
      }),
      // Deduct from doctor's balance
      db.user.update({
        where: { id: payout.doctorId },
        data: {
          creditBalance: {
            decrement: payout.amount,
          },
        },
      }),
      // Create credit transaction
      db.creditTransaction.create({
        data: {
          userId: payout.doctorId,
          amount: -payout.amount,
          type: "SPENT",
          description: `Payout completed - ${payout.payoutMethod} - Ref: ${data.transactionRef}`,
          balanceBefore: payout.balanceBefore,
          balanceAfter: payout.balanceAfter,
        },
      }),
    ]);

    // Notify doctor
    await db.notification.create({
      data: {
        userId: payout.doctorId,
        type: "SYSTEM",
        title: "Payout Completed",
        message: `Your payout of KSH ${payout.amount.toFixed(2)} has been completed. Transaction Ref: ${data.transactionRef}`,
        actionUrl: `/dashboard/payouts/${data.payoutId}`,
        relatedId: data.payoutId,
      },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: admin.id,
        action: "complete_payout",
        targetType: "payout",
        targetId: data.payoutId,
        reason: data.adminNotes || null,
        metadata: {
          amount: payout.amount,
          doctorId: payout.doctorId,
          transactionRef: data.transactionRef,
        },
      },
    });

    revalidatePath('/admin/payouts');

    return {
      success: true,
      message: "Payout completed successfully",
    };
  } catch (error) {
    console.error("Failed to complete payout:", error);
    return { success: false, error: "Failed to complete payout" };
  }
}

/**
 * Mark payout as failed (Admin only)
 */
export async function markPayoutAsFailed(data) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const admin = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const payout = await db.payout.findUnique({
      where: { id: data.payoutId },
      include: { doctor: true },
    });

    if (!payout) {
      return { success: false, error: "Payout not found" };
    }

    if (payout.status === "COMPLETED") {
      return { success: false, error: "Cannot mark completed payout as failed" };
    }

    // Update payout
    await db.payout.update({
      where: { id: data.payoutId },
      data: {
        status: "FAILED",
        processedBy: admin.id,
        processedAt: new Date(),
        failureReason: data.failureReason,
        adminNotes: data.adminNotes || null,
      },
    });

    // Notify doctor
    await db.notification.create({
      data: {
        userId: payout.doctorId,
        type: "SYSTEM",
        title: "Payout Failed",
        message: `Your payout request for KSH ${payout.amount.toFixed(2)} has failed. Reason: ${data.failureReason}. Please contact support or submit a new request.`,
        actionUrl: `/dashboard/payouts/${data.payoutId}`,
        relatedId: data.payoutId,
      },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: admin.id,
        action: "fail_payout",
        targetType: "payout",
        targetId: data.payoutId,
        reason: data.failureReason,
        metadata: {
          amount: payout.amount,
          doctorId: payout.doctorId,
        },
      },
    });

    revalidatePath('/admin/payouts');

    return {
      success: true,
      message: "Payout marked as failed",
    };
  } catch (error) {
    console.error("Failed to update payout:", error);
    return { success: false, error: "Failed to update payout" };
  }
}

/**
 * Get payout statistics for dashboard (Admin only)
 */
export async function getPayoutStatistics(period = "month") {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const admin = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized" };
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
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    const payouts = await db.payout.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        doctor: {
          select: {
            name: true,
            speciality: true,
          },
        },
      },
    });

    // Group by status
    const byStatus = payouts.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    // Group by method
    const byMethod = payouts.reduce((acc, p) => {
      acc[p.payoutMethod] = (acc[p.payoutMethod] || 0) + 1;
      return acc;
    }, {});

    // Calculate totals
    const totalAmount = payouts
      .filter(p => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);

    const averageAmount = payouts.length > 0 
      ? payouts.reduce((sum, p) => sum + p.amount, 0) / payouts.length 
      : 0;

    return {
      success: true,
      statistics: {
        period,
        totalPayouts: payouts.length,
        byStatus,
        byMethod,
        totalAmount,
        averageAmount,
        recentPayouts: payouts.slice(0, 10),
      },
    };
  } catch (error) {
    console.error("Failed to fetch payout statistics:", error);
    return { success: false, error: "Failed to fetch statistics" };
  }
}

