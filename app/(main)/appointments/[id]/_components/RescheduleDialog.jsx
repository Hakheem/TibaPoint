"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getAvailableSlotsForDoctor, rescheduleAppointment } from "@/actions/appointments";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Form validation schema
const rescheduleSchema = z.object({
  selectedDate: z.date({
    required_error: "Please select a date",
  }),
  timeSlotId: z.string({
    required_error: "Please select a time slot",
  }),
});

export function RescheduleDialog({ appointment, trigger, onRescheduleComplete }) {
  const [open, setOpen] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(rescheduleSchema),
  });

  const selectedDate = form.watch("selectedDate");

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate && appointment?.doctorId) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, appointment?.doctorId]);

  const fetchAvailableSlots = async (date) => {
    try {
      setLoadingSlots(true);
      const result = await getAvailableSlotsForDoctor(
        appointment.doctorId,
        date.toISOString().split('T')[0]
      );

      if (result.success) {
        setAvailableSlots(result.slots || []);
      } else {
        toast.error(result.error || "Failed to fetch available slots");
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to fetch available slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const selectedSlot = availableSlots.find(slot => slot.id === values.timeSlotId);
      if (!selectedSlot) {
        toast.error("Selected time slot not found");
        return;
      }

      const result = await rescheduleAppointment(
        appointment.id,
        values.timeSlotId,
        values.selectedDate.toISOString()
      );

      if (result.success) {
        toast.success("Appointment rescheduled successfully.");
        setOpen(false);
        form.reset();
        if (onRescheduleComplete) {
          onRescheduleComplete(result.appointment);
        }
      } else {
        toast.error(result.error || "Failed to reschedule appointment");
      }
    } catch (error) {
      console.error("Error rescheduling:", error);
      toast.error("Failed to reschedule appointment");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate minimum date (tomorrow)
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);

  // Calculate maximum date (30 days from now)
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Choose a new date and time for your consultation with Dr. {appointment?.doctor?.name}
          </DialogDescription>
        </DialogHeader>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Appointments must be rescheduled at least 12 hours in advance. No fee applies.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Date Selection */}
            <FormField
              control={form.control}
              name="selectedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={submitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => 
                          date < minDate || 
                          date > maxDate
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Slot Selection */}
            <FormField
              control={form.control}
              name="timeSlotId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Time Slot</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedDate || loadingSlots || submitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedDate 
                            ? "Select a date first" 
                            : loadingSlots
                            ? "Loading available slots..."
                            : "Choose a time slot"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSlots.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          {selectedDate 
                            ? loadingSlots
                              ? "Loading..."
                              : "No available slots for this date"
                            : "Please select a date first"
                          }
                        </div>
                      ) : (
                        availableSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Appointment Info */}
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold mb-2">Current Appointment</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(appointment?.startTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(appointment?.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid || loadingSlots || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  "Confirm Reschedule"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

