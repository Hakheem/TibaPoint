"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getUserNotifications } from "@/actions/notifications";

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const result = await getUserNotifications();
      if (result.success) {
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Notifications</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">Notifications</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {unreadCount === 0 
            ? "No unread messages" 
            : `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`
          }
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}
