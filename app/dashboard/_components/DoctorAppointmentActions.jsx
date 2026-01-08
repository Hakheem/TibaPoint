"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { startVideoSession } from "@/actions/appointments";
import {  completeAppointment } from "@/actions/doctors";

const DoctorAppointmentActions = ({ appointment, canStart, canComplete, canCancel }) => {
  const router = useRouter();
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    notes: appointment.notes || "",
    diagnosis: appointment.diagnosis || "",
    prescription: appointment.prescription || "",
  });

  const handleStartSession = async () => {
    try {
      setSubmitting(true);
      const result = await startVideoSession(appointment.id);
      
      if (result.success) {
        toast.success("Video session started");
        // Navigate to video call page
        router.push(`/dashboard/appointments/${appointment.id}/video`);
      } else {
        toast.error(result.error || "Failed to start session");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to start video session");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinSession = () => {
    router.push(`/dashboard/appointments/${appointment.id}/video`);
  };

  const handleCompleteAppointment = async () => {
    if (!completeForm.diagnosis || !completeForm.prescription) {
      toast.error("Please fill in diagnosis and prescription");
      return;
    }

    try {
      setSubmitting(true);
      const result = await completeAppointment(
        appointment.id,
        completeForm.notes,
        completeForm.diagnosis,
        completeForm.prescription
      );

      if (result.success) {
        toast.success("Appointment completed successfully");
        setIsCompleteOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to complete appointment");
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeUntilAppointment = () => {
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const diffMs = startTime - now;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 0) {
      return "Started";
    } else if (diffMins < 60) {
      return `Starts in ${diffMins} minutes`;
    } else {
      const hours = Math.floor(diffMins / 60);
      return `Starts in ${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Start/Join Video Session */}
          {canStart && appointment.status === "SCHEDULED" && (
            <Button
              onClick={handleStartSession}
              disabled={submitting}
              className="w-full"
              size="lg"
            >
              <Video className="mr-2 h-5 w-5" />
              {submitting ? "Starting..." : "Start Video Consultation"}
            </Button>
          )}

          {appointment.status === "IN_PROGRESS" && (
            <Button
              onClick={handleJoinSession}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Video className="mr-2 h-5 w-5" />
              Join Video Consultation
            </Button>
          )}

          {/* Time until appointment */}
          {(appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED") && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {getTimeUntilAppointment()}
              </span>
            </div>
          )}

          {/* Complete Appointment */}
          {canComplete && (
            <Button
              onClick={() => setIsCompleteOpen(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Complete Consultation
            </Button>
          )}

          {/* Mark as No Show */}
          {canCancel && (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Mark as No Show
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Complete Appointment Dialog */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Appointment</DialogTitle>
            <DialogDescription>
              Add diagnosis, prescription, and notes for this consultation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">{appointment.patient.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(appointment.startTime).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="diagnosis">
                  Diagnosis <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis..."
                  value={completeForm.diagnosis}
                  onChange={(e) =>
                    setCompleteForm({ ...completeForm, diagnosis: e.target.value })
                  }
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="prescription">
                  Prescription <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="prescription"
                  placeholder="Enter prescription details (medications, dosage, instructions)..."
                  value={completeForm.prescription}
                  onChange={(e) =>
                    setCompleteForm({ ...completeForm, prescription: e.target.value })
                  }
                  rows={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include medication names, dosages, frequency, and duration
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or recommendations..."
                  value={completeForm.notes}
                  onChange={(e) =>
                    setCompleteForm({ ...completeForm, notes: e.target.value })
                  }
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompleteOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteAppointment}
              disabled={submitting || !completeForm.diagnosis || !completeForm.prescription}
            >
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> 
                  Complete Appointment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DoctorAppointmentActions;
