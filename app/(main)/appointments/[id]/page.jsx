// app/appointments/[id]/page.jsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { checkUser } from '@/lib/checkUser';
import { Calendar, Clock, Video, User, MapPin, FileText, Pill, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getAppointmentById } from '@/actions/doctors';

export async function generateMetadata({ params }) {
  return {
    title: 'Appointment Details | MediPass',
    description: 'View details of your medical appointment.',
  };
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
    SCHEDULED: 'bg-blue-100 text-blue-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const isPatient = currentUser?.id === appointment.patientId;

  return (
    <div className="container mx-auto padded py-20 max-w-6xl">
      <div className="mb-8">
        <nav className="flex items-center text-sm text-muted-foreground mb-4">
          <a href="/appointments" className="hover:text-primary">Appointments</a>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Appointment #{appointment.id.slice(0, 8)}</span>
        </nav>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Appointment Details</h1>
            <div className="flex items-center gap-4">
              <Badge className={statusColors[appointment.status]}>
                {appointment.status.replace('_', ' ')}
              </Badge>
              <span className="text-muted-foreground">
                ID: {appointment.id.slice(0, 8)}
              </span>
            </div>
          </div>
          
          {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && isPatient && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href={`/appointments/${appointment.id}/reschedule`}>Reschedule</a>
              </Button>
              <Button asChild>
                <a href={`/appointments/${appointment.id}/video`}>
                  <Video className="h-4 w-4 mr-2" />
                  Join Consultation
                </a>
              </Button>
            </div>
          )}
          
          {appointment.status === 'IN_PROGRESS' && (
            <Button asChild>
              <a href={`/appointments/${appointment.id}/video`}>
                <Video className="h-4 w-4 mr-2" />
                Join Consultation
              </a>
            </Button>
          )}
        </div>
      </div>

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
                  <AvatarFallback>
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
                        <p className="text-sm">{appointment.doctor.email}</p>
                      </div>
                    )}
                    
                    {appointment.doctor?.city && isPatient && (
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{appointment.doctor.city}</span>
                        </div>
                      </div>
                    )}
                    
                    {appointment.patient?.phone && !isPatient && (
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm">{appointment.patient.phone}</p>
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
                    <p>{new Date(appointment.startTime).toLocaleDateString()}</p>
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
                  <p>30 minutes</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Consultation Type</p>
                  <p>Video Call</p>
                </div>
              </div>
              
              <Separator />
              
              {appointment.patientDescription && (
                <div>
                  <p className="text-sm font-medium mb-2">Reason for Consultation</p>
                  <p className="text-muted-foreground">{appointment.patientDescription}</p>
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
                    <p className="text-muted-foreground">{appointment.diagnosis}</p>
                  </div>
                )}
                
                {appointment.notes && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">Doctor's Notes</h4>
                    </div>
                    <p className="text-muted-foreground">{appointment.notes}</p>
                  </div>
                )}
                
                {appointment.prescription && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-5 w-5 text-red-500" />
                      <h4 className="font-semibold">Prescription</h4>
                    </div>
                    <p className="text-muted-foreground">{appointment.prescription}</p>
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
                  <Button className="w-full" asChild>
                    <a href={`/appointments/${appointment.id}/video`}>
                      <Video className="h-4 w-4 mr-2" />
                      Join Consultation
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/appointments/${appointment.id}/reschedule`}>Reschedule</a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/appointments/${appointment.id}/cancel`}>Cancel Appointment</a>
                  </Button>
                </>
              )}
              
              {appointment.status === 'IN_PROGRESS' && (
                <Button className="w-full" asChild>
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
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Appointment ID</p>
                <p className="text-sm text-muted-foreground font-mono">{appointment.id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.createdAt).toLocaleString()}
                </p>
              </div>
              
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

