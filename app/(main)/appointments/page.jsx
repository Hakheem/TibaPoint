import { redirect } from 'next/navigation'
import { checkUser } from '@/lib/checkUser'
import { Calendar, Clock, Video, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPatientAppointments } from '@/actions/appointments'

export const metadata = {
  title: 'My Appointments | Tibapoint',
  description: 'View and manage your upcoming and past medical appointments.',
}
 
const statusColors = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default async function AppointmentsPage() {
  const currentUser = await checkUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }

  // Redirect non-patients to dashboard
  if (currentUser.role !== 'PATIENT') {
    redirect('/dashboard');
  }

  try {
    // Fetch appointments
    const [upcomingResult, pastResult] = await Promise.all([
      getPatientAppointments('upcoming'),
      getPatientAppointments('past')
    ]);

    // Handle data with error checking
    const upcomingAppointments = upcomingResult.success 
      ? upcomingResult.appointments 
      : [];
    
    const pastAppointments = pastResult.success 
      ? pastResult.appointments 
      : [];

    // Appointment Card Component 
    const AppointmentCard = ({ appointment, userRole = 'PATIENT' }) => {
      const status = appointment.status || 'SCHEDULED'
      const doctor = appointment.doctor
      
      return (
        <Card className="hover:shadow-md transition-shadow  ">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={doctor?.imageUrl} alt={doctor?.name} />
                  <AvatarFallback>{doctor?.name?.charAt(0) || 'D'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Dr. {doctor?.name}</CardTitle>
                  <CardDescription>{doctor?.speciality || 'General Practitioner'}</CardDescription>
                </div>
              </div>
              <Badge className={statusColors[status]}>
                {status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(appointment.startTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(appointment.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
            
            {appointment.patientDescription && (
              <div>
                <p className="text-sm font-medium mb-1">Reason for consultation:</p>
                <p className="text-sm text-muted-foreground">{appointment.patientDescription}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            {/* Action buttons based on appointment status */}
            {(status === 'SCHEDULED' || status === 'CONFIRMED') && userRole === 'PATIENT' && (
              <>
                <Button size="sm" variant="outline" asChild>
                  <a href={`/appointments/${appointment.id}`}>Reschedule</a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`/appointments/${appointment.id}`}>Cancel</a>
                </Button>
                <Button size="sm" className="ml-auto" asChild>
                  <a href={`/appointments/${appointment.id}`}>View Details</a>
                </Button>
              </>
            )}
            
            {status === 'IN_PROGRESS' && (
              <Button size="sm" className="w-full" asChild>
                <a href={`/appointments/${appointment.id}/video`}>
                  <Video className="h-4 w-4 mr-2" />
                  Join Consultation
                </a>
              </Button>
            )}
            
            {status === 'COMPLETED' && userRole === 'PATIENT' && (
              <div className="flex gap-2 w-full">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <a href={`/appointments/${appointment.id}`}>View Details</a>
                </Button>
                {!appointment.review && (
                  <Button size="sm" className="flex-1" asChild>
                    <a href={`/appointments/${appointment.id}`}>Leave Review</a>
                  </Button>
                )}
              </div>
            )}
            
            {/* Doctor actions */}
            {userRole === 'DOCTOR' && (
              <Button size="sm" className="w-full" asChild>
                <a href={`/dashboard/appointments/${appointment.id}`}>Manage Appointment</a>
              </Button>
            )}
          </CardFooter>
        </Card>
      )
    }

    return (
      <div className="container mx-auto padded py-20  ">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
          <p className="text-muted-foreground">
            Manage your upcoming and past consultations
          </p>
        </div>

        {/* Tabs for Upcoming/Past */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" className="cursor-pointer flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="cursor-pointer flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Upcoming Appointments Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    userRole={currentUser.role}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Upcoming Appointments</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    You don't have any upcoming appointments. Book a consultation with one of our doctors.
                  </p>
                  <Button asChild>
                    <a href="/doctors">Find a Doctor</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Past Appointments Tab */}
          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length > 0 ? (
              <div className="grid gap-4">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    userRole={currentUser.role}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Past Appointments</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    You haven't had any consultations yet. Your past appointments will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )

  } catch (error) {
    console.error('Error fetching appointments:', error)
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">Error Loading Appointments</h2>
          <p>There was an error loading your appointments. Please try again later.</p>
        </div>
      </div>
    )
  }
}

