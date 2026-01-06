"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define day names for display
const DAYS = [
  { id: 0, name: "Sunday", short: "Sun" },
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
  { id: 6, name: "Saturday", short: "Sat" },
];

// Time slots options
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute}`,
    label: `${displayHour}:${minute} ${period}`,
  };
});

// Form validation schema with Zod
const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0, "Please select a day").max(6, "Invalid day"),
  startTime: z.string().min(1, "Start time is required").regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().min(1, "End time is required").regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
}).refine(
  (data) => {
    const [startHour, startMinute] = data.startTime.split(":").map(Number);
    const [endHour, endMinute] = data.endTime.split(":").map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return endMinutes > startMinutes;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

const AvailabilityForm = ({ 
  onSubmit, 
  onCancel, 
  editingSlot,
  submitting = false 
}) => {
  // Initialize React Hook Form with Zod validation
  const form = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      dayOfWeek: editingSlot?.dayOfWeek || 0,
      startTime: editingSlot?.startTime || "09:00",
      endTime: editingSlot?.endTime || "17:00",
    },
  });

  const handleSubmit = async (values) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="dayOfWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Week</FormLabel>
              <Select
                value={field.value.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
                disabled={submitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.id} value={day.id.toString()}>
                      {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={submitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-48">
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={submitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-48">
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {editingSlot ? "Update Slot" : "Save Slot"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AvailabilityForm;

