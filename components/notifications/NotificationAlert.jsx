"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bell,
  X,
  ExternalLink,
  CheckCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationAsRead } from "@/actions/notifications";
import { useNotificationSSE } from "@/hooks/useNotificationSSE";
import { useAuth } from "@clerk/nextjs";

export function NotificationAlerts() {
  const {
    showPopup,
    currentPopupNotification,
    closePopup,
    playNotificationSound,
  } = useNotificationSSE();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { userId } = useAuth();

  // Initialize on client side
  useEffect(() => { 
    setMounted(true);
    // Load sound preference from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notificationSoundEnabled");
      if (saved !== null) {
        setSoundEnabled(JSON.parse(saved));
      }
    }
  }, []);

  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      try {
        await markNotificationAsRead(notificationId);
        closePopup();
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    },
    [closePopup]
  );

  const toggleSound = useCallback(
    (e) => {
      e.stopPropagation();
      const newState = !soundEnabled;
      setSoundEnabled(newState);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "notificationSoundEnabled",
          JSON.stringify(newState)
        );
      }
    },
    [soundEnabled]
  );

  const getNotificationIcon = useCallback((type) => {
    const icons = {
      APPOINTMENT: "📅",
      REMINDER: "⏰",
      SYSTEM: "🔔",
      PAYOUT: "💰",
      REVIEW: "⭐",
      VERIFICATION: "✅",
      PENALTY: "⚠️",
      CREDIT_EXPIRY: "⏳",
      REFUND: "💳",
      default: "📢",
    };
    return icons[type] || icons.default;
  }, []);

  const getNotificationColor = useCallback((type) => {
    const colors = {
      APPOINTMENT: "bg-blue-100 dark:bg-blue-900/30",
      REMINDER: "bg-amber-100 dark:bg-amber-900/30",
      SYSTEM: "bg-gray-100 dark:bg-gray-800",
      PAYOUT: "bg-green-100 dark:bg-green-900/30",
      REVIEW: "bg-purple-100 dark:bg-purple-900/30",
      VERIFICATION: "bg-teal-100 dark:bg-teal-900/30",
      PENALTY: "bg-red-100 dark:bg-red-900/30",
      CREDIT_EXPIRY: "bg-orange-100 dark:bg-orange-900/30",
      REFUND: "bg-indigo-100 dark:bg-indigo-900/30",
      default: "bg-gray-100 dark:bg-gray-800",
    };
    return colors[type] || colors.default;
  }, []);

  if (!mounted || !showPopup || !currentPopupNotification) return null;

  const notification = currentPopupNotification;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div
        className={`rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-in slide-in-from-right duration-300 overflow-hidden ${getNotificationColor(
          notification.type
        )}`}
      >
        <div className="bg-white dark:bg-gray-800 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <span className="text-lg">
                  {getNotificationIcon(notification.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {notification.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs h-7 px-2 bg-white/50 hover:bg-white/75 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark as read
                  </Button>
                  {notification.actionUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="text-xs h-7 px-2"
                    >
                      <a
                        href={notification.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSound}
                className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                title={
                  soundEnabled ? "Mute notifications" : "Unmute notifications"
                }
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closePopup}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {/* Progress bar for auto-dismiss */}
        <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-blue-500 dark:bg-blue-600"
            style={{
              animation: "slideOut 10s linear forwards",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideOut {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
