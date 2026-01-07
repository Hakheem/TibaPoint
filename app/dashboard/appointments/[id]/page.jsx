import { notFound, redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { getAppointmentById } from "@/actions/doctors";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  Stethoscope,
  Pill,
  ArrowLeft,
  Video,
  CheckCircle,
  XCircle, 
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import AppointmentActions from "./_components/AppointmentActions";

const AppointmentDetailPage = async ({ params }) => {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "DOCTOR") {
    redirect("/");
  }

  const { id } = params;
  const result = await getAppointmentById(id);

  if (result.error || !result.appointment) {
    notFound();
  }

  const appointment = result.appointment;

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
      case "NO_SHOW":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5" />;
      case "CANCELLED":
      case "NO_SHOW":
        return <XCircle className="h-5 w-5" />;
      case "IN_PROGRESS":
        return <Video className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const canStart = appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED";
  const canComplete = appointment.status === "IN_PROGRESS" || appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED";
  const canCancel = appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/appointments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Appointment Details</h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(appointment.startTime), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <Badge className={`${getStatusColor(appointment.status)} text-base px-4 py-2 flex items-center gap-2`}>
          {getStatusIcon(appointment.status)}
          {appointment.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {appointment.patient.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{appointment.patient.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    {appointment.patient.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {appointment.patient.email}
                      </div>
                    )}
                    {appointment.patient.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {appointment.patient.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {appointment.patient.dateOfBirth && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">
                      {format(new Date(appointment.patient.dateOfBirth), "MMM d, yyyy")}
                    </p>
                  </div>
                )}
                {appointment.patient.gender && (
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{appointment.patient.gender}</p>
                  </div>
                )}
                {appointment.patient.city && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {appointment.patient.city}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Patient Description */}
          {appointment.patientDescription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Patient's Concern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {appointment.patientDescription}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Medical Records (if completed) */}
          {appointment.status === "COMPLETED" && (
            <>
              {appointment.diagnosis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Diagnosis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{appointment.diagnosis}</p>
                  </CardContent>
                </Card>
              )}

              {appointment.prescription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Prescription
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap font-mono text-sm">
                      {appointment.prescription}
                    </p>
                  </CardContent>
                </Card>
              )}

              {appointment.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Additional Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {appointment.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Cancellation Details */}
          {appointment.status === "CANCELLED" && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  Cancellation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {appointment.cancelledBy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cancelled By</p>
                    <p className="font-medium capitalize">{appointment.cancelledBy.toLowerCase()}</p>
                  </div>
                )}
                {appointment.cancelledAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cancelled At</p>
                    <p className="font-medium">
                      {format(new Date(appointment.cancelledAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                )}
                {appointment.cancellationReason && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="font-medium">{appointment.cancellationReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Appointment Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium text-lg">
                  {format(new Date(appointment.startTime), "MMMM d, yyyy")}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium text-lg">
                  {format(new Date(appointment.startTime), "h:mm a")}
                  {appointment.endTime && ` - ${format(new Date(appointment.endTime), "h:mm a")}`}
                </p>
              </div>
              {appointment.actualDuration && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Actual Duration</p>
                    <p className="font-medium">{appointment.actualDuration} minutes</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits Charged</span>
                <span className="font-medium">{appointment.creditsCharged} credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package Price</span>
                <span className="font-medium">KSh {appointment.packagePrice}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Earnings</span>
                <span className="font-semibold text-lg">
                  KSh {Math.round(appointment.doctorEarnings)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="text-muted-foreground">
                  KSh {Math.round(appointment.platformEarnings)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <AppointmentActions
            appointment={appointment}
            canStart={canStart}
            canComplete={canComplete}
            canCancel={canCancel}
          />

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(new Date(appointment.createdAt), "MMM d, h:mm a")}
                </p>
              </div>
              {appointment.confirmedAt && (
                <div>
                  <p className="text-muted-foreground">Confirmed</p>
                  <p className="font-medium">
                    {format(new Date(appointment.confirmedAt), "MMM d, h:mm a")}
                  </p>
                </div>
              )}
              {appointment.startedAt && (
                <div>
                  <p className="text-muted-foreground">Started</p>
                  <p className="font-medium">
                    {format(new Date(appointment.startedAt), "MMM d, h:mm a")}
                  </p>
                </div>
              )}
              {appointment.completedAt && (
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-medium">
                    {format(new Date(appointment.completedAt), "MMM d, h:mm a")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailPage;

