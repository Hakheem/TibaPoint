"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getDoctorAvailability } from "@/actions/doctors";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AvailabilitySummary() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const result = await getDoctorAvailability();
      if (result.success && result.slots) {
        setSlots(result.slots);
      }
    } catch (error) {
      console.error("Failed to load availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const getAvailableDays = () => {
    const daysWithSlots = new Set(slots.map(slot => slot.dayOfWeek));
    return DAYS_SHORT.filter((_, index) => daysWithSlots.has(index));
  };

  const getTotalHours = () => {
    let totalMinutes = 0;
    
    slots.forEach(slot => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      totalMinutes += (endMinutes - startMinutes);
    });
    
    return Math.round(totalMinutes / 60);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Availability Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableDays = getAvailableDays();
  const totalHours = getTotalHours();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Availability Summary
          </div>
          <Link href="/dashboard/availability">
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Available Days</span>
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              {availableDays.length > 0 ? (
                availableDays.map((day) => (
                  <Badge
                    key={day}
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs"
                  >
                    {day}
                  </Badge>
                ))
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs"
                >
                  None set
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Weekly Hours</span>
            </div>
            <span className="font-semibold">{totalHours} hours</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Time Slots</span>
            </div>
            <span className="font-semibold">{slots.length} slots</span>
          </div>
          
          {slots.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Next Available Slot:</p>
              <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                <div>
                  <p className="font-medium text-sm">
                    {DAYS_SHORT[slots[0].dayOfWeek]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(slots[0].startTime)} - {formatTime(slots[0].endTime)}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Open
                </Badge>
              </div>
            </div>
          )}
          
          <Link href="/dashboard/availability" className="block pt-4">
            <Button variant="outline" className="w-full">
              Manage Availability
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

