"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import NotificationService from "@/lib/services/notificationService";

// NOTIFICATION PREFERENCE HELPER
/**
 * Determine notification preferences (sound and popup) based on user role and notification type
 * @param {string} role - User role (PATIENT, DOCTOR, ADMIN)
 * @param {string} type - Notification type
 * @returns {Object} - { sound: boolean, showPopup: boolean }
 */
function getNotificationPreferences(role, type) {
  // Default preferences
  const defaultPrefs = { sound: true, showPopup: true };

  // PATIENT role preferences
  if (role === "PATIENT") {
    const patientPrefs = {
      APPOINTMENT: { sound: true, showPopup: true }, // High priority
      REMINDER: { sound: true, showPopup: true }, // High priority
      REFUND: { sound: true, showPopup: true }, // High priority (money related)
      CREDIT_EXPIRY: { sound: false, showPopup: true }, // Warning but less urgent
      SYSTEM: { sound: false, showPopup: false }, // Low priority
    };
    return patientPrefs[type] || defaultPrefs;
  }

  // DOCTOR role preferences
  if (role === "DOCTOR") {
    const doctorPrefs = {
      APPOINTMENT: { sound: true, showPopup: true }, // High priority
      REMINDER: { sound: true, showPopup: true }, // High priority
      REVIEW: { sound: true, showPopup: true }, // Important for reputation
      PENALTY: { sound: true, showPopup: true }, // Very important (urgent)
      VERIFICATION: { sound: false, showPopup: true }, // Admin related
      SYSTEM: { sound: false, showPopup: false }, // Low priority
    };
    return doctorPrefs[type] || defaultPrefs;
  }

  // ADMIN role preferences
  if (role === "ADMIN") {
    const adminPrefs = {
      APPOINTMENT: { sound: false, showPopup: false }, // Dashboard monitoring
      REMINDER: { sound: false, showPopup: false }, // Low priority
      REVIEW: { sound: false, showPopup: false }, // Dashboard monitoring
      PENALTY: { sound: true, showPopup: true }, // Critical
      VERIFICATION: { sound: true, showPopup: true }, // Critical (admin action needed)
      PAYOUT: { sound: true, showPopup: true }, // Financial (important)
      SYSTEM: { sound: false, showPopup: false }, // Dashboard monitoring
    };
    return adminPrefs[type] || defaultPrefs;
  }

  return defaultPrefs;
}

export async function getUserNotifications(filters = {}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const whereClause = {
      userId: user.id,
    };

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.isRead !== undefined) {
      whereClause.isRead = filters.isRead;
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: filters.limit || 50,
    });

    // Get unread count
    const unreadCount = await db.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return {
      success: true,
      notifications,
      unreadCount,
    };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

export async function getNotificationsByRole(filters = {}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const whereClause = {
      userId: user.id,
    };

    // Role-specific filtering
    if (user.role === "PATIENT") {
      // Patients see: APPOINTMENT, REMINDER, REFUND, CREDIT_EXPIRY, SYSTEM
      whereClause.type = {
        in: ["APPOINTMENT", "REMINDER", "REFUND", "CREDIT_EXPIRY", "SYSTEM"],
      };
    } else if (user.role === "DOCTOR") {
      // Doctors see: APPOINTMENT, REMINDER, REVIEW, PENALTY, VERIFICATION, SYSTEM
      whereClause.type = {
        in: [
          "APPOINTMENT",
          "REMINDER",
          "REVIEW",
          "PENALTY",
          "VERIFICATION",
          "SYSTEM",
        ],
      };
    } else if (user.role === "ADMIN") {
      // Admins see everything
      // No type filter needed
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.isRead !== undefined) {
      whereClause.isRead = filters.isRead;
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: filters.limit || 50,
    });

    // Get unread count by type
    const unreadByType = await db.notification.groupBy({
      by: ["type"],
      where: {
        userId: user.id,
        isRead: false,
      },
      _count: {
        id: true,
      },
    });

    const unreadCount = await db.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return {
      success: true,
      notifications,
      unreadCount,
      unreadByType: unreadByType.reduce((acc, item) => {
        acc[item.type] = item._count.id;
        return acc;
      }, {}),
    };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify notification exists
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return { success: false, error: "Notification not found" };
    }

    // Ensure the notification belongs to the authenticated user ONLY
    // Each role can only mark their own notifications as read
    if (notification.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Update notification
    await db.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      message: "Notification marked as read",
    };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error: "Failed to update notification" };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const result = await db.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      message: `${result.count} notifications marked as read`,
      count: result.count,
    };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}

export async function deleteNotification(notificationId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify notification belongs to user
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return { success: false, error: "Notification not found" };
    }

    if (notification.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete notification
    await db.notification.delete({
      where: { id: notificationId },
    });

    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      message: "Notification deleted",
    };
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function deleteReadNotifications() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const result = await db.notification.deleteMany({
      where: {
        userId: user.id,
        isRead: true,
      },
    });

    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      message: `${result.count} notifications deleted`,
      count: result.count,
    };
  } catch (error) {
    console.error("Failed to delete notifications:", error);
    return { success: false, error: "Failed to delete notifications" };
  }
}

export async function getNotificationStatistics() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get counts by type
    const byType = await db.notification.groupBy({
      by: ["type"],
      where: {
        userId: user.id,
      },
      _count: {
        id: true,
      },
    });

    // Get unread count
    const unreadCount = await db.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    // Get total count
    const totalCount = await db.notification.count({
      where: {
        userId: user.id,
      },
    });

    // Get recent notifications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCount = await db.notification.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return {
      success: true,
      statistics: {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
        recent: recentCount,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        }, {}),
      },
    };
  } catch (error) {
    console.error("Failed to fetch notification statistics:", error);
    return { success: false, error: "Failed to fetch statistics" };
  }
}

// ============================================
// ADMIN NOTIFICATION FUNCTIONS
// ============================================

/**
 * Get admin's own notifications (not all platform notifications)
 * Admins can only see and manage their own notifications
 */
export async function getAdminNotifications(filters = {}) {
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
      select: { id: true, role: true },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    const whereClause = {
      userId: admin.id, // Only admin's own notifications
    };

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.isRead !== undefined) {
      whereClause.isRead = filters.isRead;
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: filters.limit || 50,
    });

    const unreadCount = await db.notification.count({
      where: {
        userId: admin.id,
        isRead: false,
      },
    });

    const totalCount = await db.notification.count({
      where: {
        userId: admin.id,
      },
    });

    return {
      success: true,
      notifications,
      unreadCount,
      statistics: {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
      },
    };
  } catch (error) {
    console.error("Failed to fetch admin notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

/**
 * Mark admin's own notification as read
 */
export async function markAdminNotificationAsRead(notificationId) {
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
      select: { id: true },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return { success: false, error: "Notification not found" };
    }

    // Ensure the notification belongs to the admin
    if (notification.userId !== admin.id) {
      return {
        success: false,
        error: "Unauthorized - Cannot mark other users' notifications",
      };
    }

    await db.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/admin/notifications");

    return {
      success: true,
      message: "Notification marked as read",
    };
  } catch (error) {
    console.error("Failed to mark admin notification as read:", error);
    return { success: false, error: "Failed to update notification" };
  }
}

/**
 * Mark all admin's own notifications as read
 */
export async function markAllAdminNotificationsAsRead() {
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
      select: { id: true },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    const result = await db.notification.updateMany({
      where: {
        userId: admin.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/admin/notifications");

    return {
      success: true,
      message: `${result.count} notifications marked as read`,
      count: result.count,
    };
  } catch (error) {
    console.error("Failed to mark all admin notifications as read:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}

/**
 * Delete admin's own notification
 */
export async function deleteAdminNotification(notificationId) {
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
      select: { id: true },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return { success: false, error: "Notification not found" };
    }

    if (notification.userId !== admin.id) {
      return {
        success: false,
        error: "Unauthorized - Cannot delete other users' notifications",
      };
    }

    await db.notification.delete({
      where: { id: notificationId },
    });

    revalidatePath("/admin/notifications");

    return {
      success: true,
      message: "Notification deleted",
    };
  } catch (error) {
    console.error("Failed to delete admin notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

/**
 * Delete admin's read notifications
 */
export async function deleteAdminReadNotifications() {
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
      select: { id: true },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    const result = await db.notification.deleteMany({
      where: {
        userId: admin.id,
        isRead: true,
      },
    });

    revalidatePath("/admin/notifications");

    return {
      success: true,
      message: `${result.count} notifications deleted`,
      count: result.count,
    };
  } catch (error) {
    console.error("Failed to delete admin read notifications:", error);
    return { success: false, error: "Failed to delete notifications" };
  }
}

export async function sendNotificationToUser(data) {
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

    // Verify target user exists
    const targetUser = await db.user.findUnique({
      where: { id: data.userId },
    });

    if (!targetUser) {
      return { success: false, error: "Target user not found" };
    }

    // Create notification
    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl || null,
        relatedId: data.relatedId || null,
      },
    });

    return {
      success: true,
      message: "Notification sent successfully",
      notification,
    };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}

export async function sendBulkNotifications(data) {
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

    // Create notifications for all users
    const notifications = await Promise.all(
      data.userIds.map((userId) =>
        db.notification.create({
          data: {
            userId,
            type: data.type,
            title: data.title,
            message: data.message,
            actionUrl: data.actionUrl || null,
          },
        }),
      ),
    );

    return {
      success: true,
      message: `${notifications.length} notifications sent successfully`,
      count: notifications.length,
    };
  } catch (error) {
    console.error("Failed to send bulk notifications:", error);
    return { success: false, error: "Failed to send notifications" };
  }
}

export async function sendNotificationToRole(data) {
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

    // Get all users with the specified role. If role is 'ALL', don't filter by role
    let users;
    if (data.role === "ALL") {
      users = await db.user.findMany({
        select: { id: true },
      });
    } else {
      users = await db.user.findMany({
        where: { role: data.role },
        select: { id: true },
      });
    }

    // Create notifications for all users
    const notifications = await Promise.all(
      users.map((user) =>
        db.notification.create({
          data: {
            userId: user.id,
            type: data.type,
            title: data.title,
            message: data.message,
            actionUrl: data.actionUrl || null,
          },
        }),
      ),
    );

    return {
      success: true,
      message: `${notifications.length} notifications sent to all ${data.role}s`,
      count: notifications.length,
    };
  } catch (error) {
    console.error("Failed to send role notifications:", error);
    return { success: false, error: "Failed to send notifications" };
  }
}

export async function getAllNotificationsAdmin(filters = {}) {
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

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.isRead !== undefined) {
      whereClause.isRead = filters.isRead;
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

    const notifications = await db.notification.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: filters.limit || 100,
    });

    // Get statistics
    const totalCount = await db.notification.count({ where: whereClause });
    const unreadCount = await db.notification.count({
      where: { ...whereClause, isRead: false },
    });

    return {
      success: true,
      notifications,
      statistics: {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
      },
    };
  } catch (error) {
    console.error("Failed to fetch all notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

export async function createAndSendNotification(data) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Create notification in database
    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl || null,
        relatedId: data.relatedId || null,
      },
    });

    // Get user role to determine notification preferences
    const recipient = await db.user.findUnique({
      where: { id: data.userId },
      select: { role: true },
    });

    // Determine sound and popup settings based on role and notification type
    const notificationSettings = getNotificationPreferences(
      recipient?.role,
      data.type,
    );

    // Send via SSE
    await NotificationService.sendToUser(data.userId, {
      type: "NEW_NOTIFICATION",
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        actionUrl: notification.actionUrl,
      },
      sound: notificationSettings.sound,
      showPopup: notificationSettings.showPopup,
    });

    return {
      success: true,
      message: "Notification sent",
      notification,
    };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
