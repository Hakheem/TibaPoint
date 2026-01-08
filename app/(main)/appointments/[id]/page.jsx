// app/appointments/[id]/page.jsx - UPDATED VERSION
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { checkUser } from '@/lib/checkUser';
import { Calendar, Clock, Video, User, MapPin, FileText, Pill, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAppointmentById } from '@/actions/doctors';

export async function generateMetadata({ params }) {
  return {
    title: 'Appointment Details | MediPass',
    description: 'View details of your medical appointment.',
  };
} 

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

export default async function AppointmentDetailsPage({ params }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const currentUser = await checkUser();
  const resolvedParams = await params;
  const appointmentId = resolvedParams?.id;

  // Get appointment details
  const { appointment, error } = await getAppointmentById(appointmentId);
  
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
              <a href="/appointments">View All Appointments</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has access to this appointment
  if (currentUser?.id !== appointment.patientId && currentUser?.id !== appointment.doctorId && currentUser?.role !== 'ADMIN') {
    redirect('/appointments');
  }

  const statusColors = {
    SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const isPatient = currentUser?.id === appointment.patientId;
  const canJoin = canJoinAppointment(appointment);
  const timeInfo = getTimeUntilAppointment(appointment.startTime);

  return (
    <div className="container mx-auto padded py-20 ">
      <div className="mb-8">
        <nav className="flex items-center text-sm text-muted-foreground mb-4">
          <a href="/appointments" className="hover:text-primary">Appointments</a>
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
          {isPatient && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') && (
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
        </div>
      </div>

      {/* Join Call Alert */}
      {isPatient && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') && (
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

      {appointment.status === 'IN_PROGRESS' && isPatient && (
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
                {isPatient ? 'Doctor Information' : 'Patient Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={isPatient ? appointment.doctor?.imageUrl : appointment.patient?.imageUrl} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                    {(isPatient ? appointment.doctor?.name : appointment.patient?.name)?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {isPatient ? `Dr. ${appointment.doctor?.name}` : appointment.patient?.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {isPatient ? appointment.doctor?.speciality : 'Patient'}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-3">
                    {isPatient && appointment.doctor?.email && (
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{appointment.doctor.email}</p>
                      </div>
                    )}
                    
                    {appointment.doctor?.city && isPatient && (
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
              {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && isPatient && (
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
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/appointments/${appointment.id}/reschedule`}>Reschedule</a>
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700" asChild>
                    <a href={`/appointments/${appointment.id}/cancel`}>Cancel Appointment</a>
                  </Button>
                </>
              )}
              
              {appointment.status === 'IN_PROGRESS' && isPatient && (
                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" asChild>
                  <a href={`/appointments/${appointment.id}/video`}>
                    <Video className="h-4 w-4 mr-2" />
                    Join Consultation
                  </a>
                </Button>
              )}
              
              {appointment.status === 'COMPLETED' && isPatient && !appointment.review && (
                <Button className="w-full" asChild>
                  <a href={`/appointments/${appointment.id}/review`}>Leave Review</a>
                </Button>
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

