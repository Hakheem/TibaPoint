"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  MapPin, 
  FileText, 
  Pill, 
  Activity, 
  AlertCircle,
  Star,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAppointmentById } from "@/actions/doctors";
import { getCurrentUser } from "@/actions/get-current-user";
import { ReviewDialog } from "./_components/ReviewDialog";
import { RescheduleDialog } from "./_components/RescheduleDialog";
import { CancelAppointmentDialog} from "./_components/CancelAppointmentDialog";

// Helper function to check if appointment can be joined
function canJoinAppointment(appointment) {
  const now = new Date();
  const startTime = new Date(appointment.startTime);
  const endTime = appointment.endTime ? new Date(appointment.endTime) : new Date(startTime.getTime() + 90 * 60000);
  
  // Allow joining 15 minutes before start time
  const canJoinStart = new Date(startTime.getTime() - 15 * 60000);
  const canJoinEnd = new Date(endTime.getTime() + 15 * 60000);
  
  return now >= canJoinStart && now <= canJoinEnd;
}

// Helper to get time until appointment
function getTimeUntilAppointment(startTime) {
  const now = new Date();
  const start = new Date(startTime);
  const diffMs = start - now;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 0) {
    return { message: "In progress", canJoin: true, color: "text-green-600" };
  } else if (diffMins <= 15) {
    return { message: `Starts in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`, canJoin: true, color: "text-green-600" };
  } else if (diffMins < 60) {
    return { message: `Starts in ${diffMins} minutes`, canJoin: false, color: "text-blue-600" };
  } else {
    const hours = Math.floor(diffMins / 60);
    return { message: `Starts in ${hours} hour${hours > 1 ? 's' : ''}`, canJoin: false, color: "text-blue-600" };
  }
}

export default function AppointmentDetailsPage() {
  const params = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const appointmentId = params.id;

  useEffect(() => {
    loadUserAndAppointment();
  }, [appointmentId]);

  const loadUserAndAppointment = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const userResult = await getCurrentUser();
      if (!userResult.success || !userResult.user) {
        toast.error("Please sign in to view this appointment");
        window.location.href = "/sign-in";
        return;
      }
      
      const user = userResult.user;
      setCurrentUser(user);

      // Get appointment
      const result = await getAppointmentById(appointmentId);
      
      if (result.success) {
        const appointmentData = result.appointment;
        
        // Verify the user has access to this appointment
        const hasAccess = 
          user.id === appointmentData.patientId || 
          user.id === appointmentData.doctorId || 
          user.role === "ADMIN";
        
        if (!hasAccess) {
          setError("You don't have permission to view this appointment");
          toast.error("Access denied");
          return;
        }
        
        setAppointment(appointmentData);
      } else {
        setError(result.error || "Failed to load appointment");
        toast.error(result.error || "Failed to load appointment");
      }
    } catch (error) {
      console.error("Error loading appointment:", error);
      setError("Failed to load appointment");
      toast.error("Failed to load appointment");
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if current user is this appointment's patient
  const isThisAppointmentsPatient = () => {
    return currentUser && appointment && currentUser.id === appointment.patientId;
  };

  // Helper to determine if current user is this appointment's doctor
  const isThisAppointmentsDoctor = () => {
    return currentUser && appointment && currentUser.id === appointment.doctorId;
  };

  // Helper to determine if current user is admin
  const isAdmin = () => {
    return currentUser && currentUser.role === "ADMIN";
  };

  const handleReviewSubmitted = (review) => {
    // Update appointment with review
    setAppointment(prev => ({
      ...prev,
      review
    }));
    toast.success("Thank you for your review!");
  };

  const handleRescheduleComplete = (updatedAppointment) => {
    // Update appointment with new time
    setAppointment(updatedAppointment);
    toast.success("Appointment rescheduled successfully!");
  };

  const handleCancelComplete = () => {
    // Update appointment status
    setAppointment(prev => ({
      ...prev,
      status: "CANCELLED"
    }));
    toast.success("Appointment cancelled successfully!");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading appointment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-4">Appointment Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The appointment you are looking for does not exist or you do not have permission to view it.'}
            </p>
            <Button asChild>
              <a href="/appointments" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                View All Appointments
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors = {
    SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const canJoin = canJoinAppointment(appointment);
  const timeInfo = getTimeUntilAppointment(appointment.startTime);

  return (
    <div className="container mx-auto padded py-20">
      <div className="mb-8">
        <nav className="flex items-center text-sm text-muted-foreground mb-4">
          <a href="/appointments" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Appointments
          </a>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Appointment #{appointment.id.slice(0, 8)}</span>
        </nav>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Appointment Details</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge className={statusColors[appointment.status]}>
                {appointment.status.replace('_', ' ')}
              </Badge>
              <span className="text-muted-foreground">
                ID: {appointment.id.slice(0, 8)}
              </span>
            </div>
          </div>
          
          {/* Video Join Button - Prominent Display */}
          {isThisAppointmentsPatient() && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') && (
            <div className="flex flex-col gap-2 md:items-end">
              {canJoin ? (
                <Button size="lg" asChild className="bg-green-600 hover:bg-green-700">
                  <a href={`/appointments/${appointment.id}/video`}>
                    <Video className="h-5 w-5 mr-2" />
                    Join Consultation Now
                  </a>
                </Button>
              ) : (
                <Button size="lg" disabled className="cursor-not-allowed">
                  <Clock className="h-5 w-5 mr-2" />
                  Join Consultation
                </Button>
              )}
              <p className={`text-sm font-medium ${timeInfo.color}`}>
                {timeInfo.message}
              </p>
            </div>
          )}

          {/* Doctor Actions */}
          {isThisAppointmentsDoctor() && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
            <div className="flex flex-col gap-2 md:items-end">
              {canJoin ? (
                <Button size="lg" asChild className="bg-green-600 hover:bg-green-700">
                  <a href={`/dashboard/appointments/${appointment.id}/video`}>
                    <Video className="h-5 w-5 mr-2" />
                    Start Consultation
                  </a>
                </Button>
              ) : (
                <Button size="lg" disabled className="cursor-not-allowed">
                  <Clock className="h-5 w-5 mr-2" />
                  Start Consultation Soon
                </Button>
              )}
              <p className={`text-sm font-medium ${timeInfo.color}`}>
                {timeInfo.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Join Call Alert for Patient */}
      {isThisAppointmentsPatient() && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') && (
        <Alert className={canJoin ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 mb-6" : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 mb-6"}>
          <Video className={`h-4 w-4 ${canJoin ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
          <AlertDescription className={canJoin ? 'text-green-800 dark:text-green-300' : 'text-blue-800 dark:text-blue-300'}>
            {canJoin ? (
              <div>
                <strong>Ready to join!</strong> Your consultation is ready. Click the button above to join the video call.
              </div>
            ) : (
              <div>
                <strong>Consultation scheduled.</strong> You can join the video call 15 minutes before the scheduled time.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Start Call Alert for Doctor */}
      {isThisAppointmentsDoctor() && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
        <Alert className={canJoin ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 mb-6" : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 mb-6"}>
          <Video className={`h-4 w-4 ${canJoin ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
          <AlertDescription className={canJoin ? 'text-green-800 dark:text-green-300' : 'text-blue-800 dark:text-blue-300'}>
            {canJoin ? (
              <div>
                <strong>Ready to start!</strong> You can now start the consultation. Click the button above to begin the video call.
              </div>
            ) : (
              <div>
                <strong>Consultation scheduled.</strong> You can start the video call 15 minutes before the scheduled time.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {appointment.status === 'IN_PROGRESS' && isThisAppointmentsPatient() && (
        <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 mb-6">
          <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <AlertDescription className="text-purple-800 dark:text-purple-300">
            <strong>Consultation in progress!</strong> Dr. {appointment.doctor?.name} has started the session. Join now to continue your consultation.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Appointment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor/Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isThisAppointmentsPatient() 
                  ? 'Doctor Information' 
                  : isThisAppointmentsDoctor()
                  ? 'Patient Information'
                  : isAdmin()
                  ? 'Appointment Details'
                  : 'Appointment Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={
                    isThisAppointmentsPatient() || isAdmin()
                      ? appointment.doctor?.imageUrl 
                      : appointment.patient?.imageUrl
                  } />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                    {(isThisAppointmentsPatient() || isAdmin()
                      ? appointment.doctor?.name 
                      : appointment.patient?.name
                    )?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {isThisAppointmentsPatient() || isAdmin()
                      ? `Dr. ${appointment.doctor?.name}` 
                      : appointment.patient?.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {isThisAppointmentsPatient() || isAdmin()
                      ? appointment.doctor?.speciality 
                      : 'Patient'}
                  </p>
                  
                  {(isThisAppointmentsPatient() || isAdmin()) && appointment.doctor?.rating && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(appointment.doctor.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : star <= Math.ceil(appointment.doctor.rating) && !Number.isInteger(appointment.doctor.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {appointment.doctor.rating.toFixed(1)} ({appointment.doctor.totalReviews || 0} reviews)
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-4 mt-3">
                    {(isThisAppointmentsPatient() || isAdmin()) && appointment.doctor?.email && (
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{appointment.doctor.email}</p>
                      </div>
                    )}
                    
                    {isThisAppointmentsDoctor() && appointment.patient?.email && (
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{appointment.patient.email}</p>
                      </div>
                    )}
                    
                    {(isThisAppointmentsPatient() || isAdmin()) && appointment.doctor?.city && (
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{appointment.doctor.city}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p>{new Date(appointment.startTime).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p>{new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-muted-foreground">30 minutes</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Consultation Type</p>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">Video Call</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {appointment.patientDescription && (
                <div>
                  <p className="text-sm font-medium mb-2">Reason for Consultation</p>
                  <p className="text-muted-foreground bg-muted p-3 rounded-lg">{appointment.patientDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultation Notes (if completed) */}
          {appointment.status === 'COMPLETED' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Consultation Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {appointment.diagnosis && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">Diagnosis</h4>
                    </div>
                    <p className="text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">{appointment.diagnosis}</p>
                  </div>
                )}
                
                {appointment.prescription && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-5 w-5 text-red-500" />
                      <h4 className="font-semibold">Prescription</h4>
                    </div>
                    <div className="text-muted-foreground bg-red-50 dark:bg-red-900/20 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                      {appointment.prescription}
                    </div>
                  </div>
                )}
                
                {appointment.notes && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">Doctor's Notes</h4>
                    </div>
                    <p className="text-muted-foreground bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">{appointment.notes}</p>
                  </div>
                )}

                {/* Review Section (only for patient) */}
                {isThisAppointmentsPatient() && (
                  appointment.review ? (
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          Your Review
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {new Date(appointment.review.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= appointment.review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{appointment.review.rating}.0</span>
                        </div>
                        {appointment.review.comment && (
                          <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                            {appointment.review.comment}
                          </p>
                        )}
                        {!appointment.review.isPublic && (
                          <p className="text-sm text-muted-foreground">
                            This review is private and only visible to you and the doctor.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-6">
                      <h4 className="font-semibold mb-4">Share Your Experience</h4>
                      <ReviewDialog
                        appointmentId={appointment.id}
                        trigger={
                          <Button>
                            <Star className="h-4 w-4 mr-2" />
                            Leave a Review
                          </Button>
                        }
                        onReviewSubmitted={handleReviewSubmitted}
                      />
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Patient Actions */}
              {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && isThisAppointmentsPatient() && (
                <>
                  {canJoin ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" asChild>
                      <a href={`/appointments/${appointment.id}/video`}>
                        <Video className="h-4 w-4 mr-2" />
                        Join Consultation
                      </a>
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Join Available Soon
                    </Button>
                  )}
                  <Separator />
                  <RescheduleDialog
                    appointment={appointment}
                    trigger={
                      <Button variant="outline" className="w-full">
                        Reschedule
                      </Button>
                    }
                    onRescheduleComplete={handleRescheduleComplete}
                  />
                  <CancelAppointmentDialog
                    appointment={appointment}
                    trigger={
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                        Cancel Appointment
                      </Button>
                    }
                    onCancelComplete={handleCancelComplete}
                  />
                </>
              )}
              
              {/* Doctor Actions */}
              {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && isThisAppointmentsDoctor() && (
                <>
                  {canJoin ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" asChild>
                      <a href={`/dashboard/appointments/${appointment.id}/video`}>
                        <Video className="h-4 w-4 mr-2" />
                        Start Consultation
                      </a>
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Start Available Soon
                    </Button>
                  )}
                </>
              )}
              
              {appointment.status === 'IN_PROGRESS' && isThisAppointmentsPatient() && (
                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" asChild>
                  <a href={`/appointments/${appointment.id}/video`}>
                    <Video className="h-4 w-4 mr-2" />
                    Join Consultation
                  </a>
                </Button>
              )}
              
              {appointment.status === 'IN_PROGRESS' && isThisAppointmentsDoctor() && (
                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" asChild>
                  <a href={`/dashboard/appointments/${appointment.id}/video`}>
                    <Video className="h-4 w-4 mr-2" />
                    Continue Consultation
                  </a>
                </Button>
              )}
              
              {appointment.status === 'COMPLETED' && isThisAppointmentsPatient() && !appointment.review && (
                <ReviewDialog
                  appointmentId={appointment.id}
                  trigger={
                    <Button className="w-full">
                      <Star className="h-4 w-4 mr-2" />
                      Leave Review
                    </Button>
                  }
                  onReviewSubmitted={handleReviewSubmitted}
                />
              )}
            </CardContent>
          </Card>

          {/* Cost Information */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Consultation Cost</span>
                <span className="font-medium">2 credits</span>
              </div>
              
              {appointment.status === 'CANCELLED' && appointment.creditsRefunded > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-sm">Refunded Credits</span>
                  <span className="font-medium">{appointment.creditsRefunded} credits</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {appointment.status === 'CANCELLED' && appointment.creditsRefunded > 0 
                    ? `${2 - appointment.creditsRefunded} credits` 
                    : '2 credits'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.createdAt).toLocaleString()}
                </p>
              </div>
              
              {appointment.startedAt && (
                <div>
                  <p className="text-sm font-medium">Started</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(appointment.startedAt).toLocaleString()}
                  </p>
                </div>
              )}
              
              {appointment.completedAt && (
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(appointment.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
              
              {appointment.cancelledAt && (
                <div>
                  <p className="text-sm font-medium">Cancelled</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(appointment.cancelledAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

