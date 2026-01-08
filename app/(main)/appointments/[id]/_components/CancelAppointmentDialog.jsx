"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cancelPatientAppointment } from "@/actions/appointments";

const cancelSchema = z.object({
  reason: z.string().min(10, "Please provide a reason (minimum 10 characters)").max(500, "Reason is too long"),
});

export function CancelAppointmentDialog({ appointment, trigger, onCancelComplete }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: "",
    },
  });

  // Calculate cancellation policy info with updated times
  const calculateCancellationPolicy = () => {
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment >= 24) {
      return {
        refund: "Full refund (2 credits)",
        message: "You'll receive a full refund since you're cancelling more than 24 hours in advance.",
        type: "success",
      };
    } else if (hoursUntilAppointment >= 12) {
      return {
        refund: "Partial refund (1 credit)",
        message: "You'll receive a partial refund since you're cancelling between 12-24 hours in advance.",
        type: "warning",
      };
    } else {
      return {
        refund: "No refund",
        message: "No refund will be issued as you're cancelling less than 12 hours before the appointment.",
        type: "error",
      };
    }
  };

  const policy = calculateCancellationPolicy();

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const result = await cancelPatientAppointment(
        appointment.id,
        values.reason
      );

      if (result.success) {
        toast.success(
          result.message || "Appointment cancelled successfully."
        );
        setOpen(false);
        form.reset();
        if (onCancelComplete) {
          onCancelComplete(result.appointment);
        }
      } else {
        toast.error(result.error || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Cancel Appointment
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? Please provide a reason.
          </DialogDescription>
        </DialogHeader>

        <Alert className={`mb-4 ${
          policy.type === "success" 
            ? "bg-green-50 border-green-200 text-green-800" 
            : policy.type === "warning"
            ? "bg-yellow-50 border-yellow-200 text-yellow-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cancellation Policy:</strong> {policy.message}
            <br />
            <strong>Refund:</strong> {policy.refund}
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain why you need to cancel this appointment..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={submitting}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {field.value.length}/500
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Appointment Info */}
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold mb-2">Appointment Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor:</span>
                  <span>Dr. {appointment.doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>
                    {new Date(appointment.startTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span>
                    {new Date(appointment.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost:</span>
                  <span>2 credits</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Keep Appointment
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Appointment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

