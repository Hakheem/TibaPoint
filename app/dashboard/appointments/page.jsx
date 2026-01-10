"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ChevronRight,
  Video,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getDoctorAppointments } from "@/actions/doctors";
import { completeAppointment } from "@/actions/doctors";

const AppointmentsPage = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    notes: "",
    diagnosis: "",
    prescription: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const result = await getDoctorAppointments(filter);
      if (result.success && result.appointments) {
        setAppointments(result.appointments);
        setFilteredAppointments(result.appointments);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredAppointments(appointments);
      return;
    }

    const filtered = appointments.filter(
      (apt) =>
        apt.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAppointments(filtered);
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleManageAppointment = (appointmentId, e) => {
    e.stopPropagation(); // Prevent triggering parent click
    router.push(`/dashboard/appointments/${appointmentId}`);
  };

  const handleOpenComplete = (appointment, e) => {
    e.stopPropagation(); // Prevent triggering parent click
    setSelectedAppointment(appointment);
    setCompleteForm({
      notes: appointment.notes || "",
      diagnosis: appointment.diagnosis || "",
      prescription: appointment.prescription || "",
    });
    setIsCompleteOpen(true);
  };

  const handleCompleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setSubmitting(true);
      const result = await completeAppointment(
        selectedAppointment.id,
        completeForm.notes,
        completeForm.diagnosis,
        completeForm.prescription
      );

      if (result.success) {
        toast.success("Appointment completed successfully");
        setIsCompleteOpen(false);
        loadAppointments();
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "CONFIRMED":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Video className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, email, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-45">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Appointments</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">
                  {
                    appointments.filter(
                      (a) =>
                        a.status === "SCHEDULED" || a.status === "CONFIRMED"
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {appointments.filter((a) => a.status === "COMPLETED").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">
                  {appointments.filter((a) => a.status === "CANCELLED").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments List</CardTitle>
          <CardDescription>
            {filteredAppointments.length} appointment
            {filteredAppointments.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold shrink-0">
                      {appointment.patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">
                          {appointment.patient.name}
                        </h3>
                        <Badge
                          className={`${getStatusColor(
                            appointment.status
                          )} flex items-center gap-1`}
                        >
                          {getStatusIcon(appointment.status)}
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(
                            new Date(appointment.startTime),
                            "MMM d, yyyy"
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(appointment.startTime), "h:mm a")}
                        </div>
                        {appointment.patient.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {appointment.patient.phone}
                          </div>
                        )}
                      </div>
                      {appointment.patientDescription && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {appointment.patientDescription}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    {/* Manage Button - Links to detail page with video actions */}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) =>
                        handleManageAppointment(appointment.id, e)
                      }
                      className="flex-1 sm:flex-initial"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>

                    {/* Quick View Details */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(appointment)}
                      className="flex-1 sm:flex-initial"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>

                    {/* Quick Complete (from modal) */}
                    {appointment.status !== "COMPLETED" &&
                      appointment.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => handleOpenComplete(appointment, e)}
                          className="flex-1 sm:flex-initial"
                        >
                          Complete
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No appointments found matching your search"
                  : "No appointments found"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about this appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </h3>
                <div className="space-y-2 pl-6">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedAppointment.patient.name}
                  </p>
                  {selectedAppointment.patient.email && (
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedAppointment.patient.email}
                    </p>
                  )}
                  {selectedAppointment.patient.phone && (
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedAppointment.patient.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Appointment Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointment Details
                </h3>
                <div className="space-y-2 pl-6">
                  <p>
                    <span className="font-medium">Status:</span>
                    <Badge
                      className={`ml-2 ${getStatusColor(
                        selectedAppointment.status
                      )}`}
                    >
                      {selectedAppointment.status}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {format(
                      new Date(selectedAppointment.startTime),
                      "MMMM d, yyyy"
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {format(new Date(selectedAppointment.startTime), "h:mm a")}{" "}
                    - {format(new Date(selectedAppointment.endTime), "h:mm a")}
                  </p>
                  {selectedAppointment.patientDescription && (
                    <div>
                      <p className="font-medium mb-1">Patient Description:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {selectedAppointment.patientDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Records (if completed) */}
              {selectedAppointment.status === "COMPLETED" && (
                <>
                  {selectedAppointment.diagnosis && (
                    <div>
                      <h3 className="font-semibold mb-3">Diagnosis</h3>
                      <p className="text-sm bg-muted p-3 rounded">
                        {selectedAppointment.diagnosis}
                      </p>
                    </div>
                  )}
                  {selectedAppointment.prescription && (
                    <div>
                      <h3 className="font-semibold mb-3">Prescription</h3>
                      <p className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                        {selectedAppointment.prescription}
                      </p>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div>
                      <h3 className="font-semibold mb-3">Notes</h3>
                      <p className="text-sm bg-muted p-3 rounded">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Link to full detail page */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    router.push(
                      `/dashboard/appointments/${selectedAppointment.id}`
                    );
                  }}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Appointment (Start Video, Complete, etc.)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Complete Appointment Dialog */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Appointment</DialogTitle>
            <DialogDescription>
              Add diagnosis, prescription, and notes for this consultation
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded">
                <p className="font-medium">
                  {selectedAppointment.patient.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(
                    new Date(selectedAppointment.startTime),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis..."
                    value={completeForm.diagnosis}
                    onChange={(e) =>
                      setCompleteForm({
                        ...completeForm,
                        diagnosis: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="prescription">Prescription *</Label>
                  <Textarea
                    id="prescription"
                    placeholder="Enter prescription details..."
                    value={completeForm.prescription}
                    onChange={(e) =>
                      setCompleteForm({
                        ...completeForm,
                        prescription: e.target.value,
                      })
                    }
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes..."
                    value={completeForm.notes}
                    onChange={(e) =>
                      setCompleteForm({
                        ...completeForm,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCompleteOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteAppointment}
                  disabled={
                    submitting ||
                    !completeForm.diagnosis ||
                    !completeForm.prescription
                  }
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;
