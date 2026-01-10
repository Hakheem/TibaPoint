"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

export function useNotificationSSE() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPopupNotification, setCurrentPopupNotification] =
    useState(null);
  const { userId } = useAuth();

  // Define tryWebAudioAPI first so it can be referenced by playNotificationSound
  const tryWebAudioAPI = useCallback(() => {
    try {
      // Fallback: Create simple beep using Web Audio API if available
      if (window.AudioContext || window.webkitAudioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.frequency.value = 800; // Hz
        oscillator.type = "sine";

        gain.gain.setValueAtTime(0.3, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);

        console.log("Fallback beep played using Web Audio API");
      }
    } catch (error) {
      console.error("Web Audio API fallback failed:", error);
    }
  }, []);

  const playNotificationSound = useCallback(
    (notification) => {
      try {
        // Check browser support and user preference
        if (typeof window === "undefined") return;

        // Respect user preference stored in localStorage
        try {
          const pref = localStorage.getItem("notificationSoundEnabled");
          if (pref !== null && JSON.parse(pref) === false) {
            // User has muted sounds
            return;
          }
        } catch (e) {
          // If localStorage access fails, continue and attempt to play
          console.warn("Could not read notification sound preference:", e);
        }

        // Preload and play audio
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.3;

        // Handle autoplay restrictions
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Notification sound played successfully");
            })
            .catch((error) => {
              console.log(
                "Sound play failed (likely autoplay restriction):",
                error && error.message ? error.message : error
              );
              // Fallback: try Web Audio API
              tryWebAudioAPI();
            });
        }
      } catch (error) {
        console.error("Sound error:", error);
      }
    },
    [tryWebAudioAPI]
  );

  useEffect(() => {
    if (!userId) return;

    let eventSource = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource(
        `/api/notifications/stream?userId=${userId}`
      );

      eventSource.onopen = () => {
        console.log("SSE Connected");
        setConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "NEW_NOTIFICATION") {
            // Handle new notification
            const notification = data.notification;
            setNotifications((prev) => [notification, ...prev]);

            // Play sound if enabled
            if (data.sound !== false) {
              playNotificationSound(notification);
            }

            // Show popup if enabled
            if (data.showPopup !== false) {
              showNotificationPopup(notification);
            }
          } else if (data.type === "ping") {
            // Keep-alive ping
            console.log("SSE Ping:", data.timestamp);
          } else if (data.type === "connected") {
            // Connection confirmation
            console.log("SSE Connection confirmed");
          }
        } catch (error) {
          console.error("SSE parse error:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        setConnected(false);
        eventSource.close();

        // Reconnect after 5 seconds
        reconnectTimeout = setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    // Cleanup
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [userId, playNotificationSound]);

  const showNotificationPopup = useCallback((notification) => {
    try {
      setCurrentPopupNotification(notification);
      setShowPopup(true);

      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowPopup(false);
        setCurrentPopupNotification(null);
      }, 10000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Popup error:", error);
    }
  }, []);

  const closePopup = useCallback(() => {
    setShowPopup(false);
    setCurrentPopupNotification(null);
  }, []);

  return {
    notifications,
    connected,
    showPopup,
    currentPopupNotification,
    closePopup,
    playNotificationSound,
  };
}


