// app/book/[doctorId]/page.jsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { checkUser } from '@/lib/checkUser';
import { Calendar, Clock, User, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { getDoctorPublicProfile } from '@/actions/doctors';
import { bookAppointmentWithValidation, getAvailableSlotsForDoctor } from '@/actions/appointments';
import BookAppointmentForm from '@/components/forms/BookAppointmentForm';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const doctorId = resolvedParams?.doctorId;
  
  try {
    const result = await getDoctorPublicProfile(doctorId);
    
    if (!result.success || !result.doctor) {
      return {
        title: 'Doctor Not Found',
      };
    }
    
    return {
      title: `Book Appointment with Dr. ${result.doctor.name} | MediPass`,
      description: `Book a video consultation with Dr. ${result.doctor.name}, ${result.doctor.speciality} specialist.`,
    };
  } catch {
    return {
      title: 'Book Appointment',
      description: 'Book a video consultation with a doctor.',
    };
  }
}

export default async function BookAppointmentPage({ params }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const currentUser = await checkUser();
  
  // Check if user is a patient
  if (currentUser?.role !== 'PATIENT') {
    redirect('/onboarding');
  }

  

  const resolvedParams = await params;
  const doctorId = resolvedParams?.doctorId;

  // Get doctor information 
  const result = await getDoctorPublicProfile(doctorId);
  
  if (!result.success || !result.doctor) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{result.error || 'Doctor not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => window.history.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const doctor = result.doctor;

  return (
    <div className="container mx-auto padded py-20 max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-8">
        <nav className="flex items-center text-sm text-muted-foreground">
          <a href="/doctors" className="hover:text-primary">Doctors</a>
          <span className="mx-2">/</span>
          <a href={`/doctor/${doctor.id}`} className="hover:text-primary">Dr. {doctor.name}</a>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Book Appointment</span>
        </nav>
      </div>

      <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
      <p className="text-muted-foreground mb-8">
        Schedule your video consultation with Dr. {doctor.name}
      </p>

      {/* Credit Check Alert */}
      {currentUser.credits < 2 && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <CreditCard className="h-4 w-4 text-amber-600" />
          <AlertTitle>Insufficient Credits</AlertTitle>
          <AlertDescription>
            You need 2 credits to book an appointment. You currently have {currentUser.credits} credit{currentUser.credits !== 1 ? 's' : ''}.
            <a href="/pricing" className="ml-2 text-primary font-medium hover:underline">
              Purchase credits
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Doctor Info & Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={doctor.imageUrl} />
                  <AvatarFallback>{doctor.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">Dr. {doctor.name}</h2>
                  <p className="text-sm text-muted-foreground">{doctor.speciality}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-lg">{doctor.experience || 5}+ years</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Rating</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{doctor.rating?.toFixed(1) || '5.0'}</span>
                    <span className="text-sm text-muted-foreground">
                      ({doctor.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-lg">{doctor.city || 'Virtual'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={doctor?.isAvailable ? 'default' : 'destructive'}>
                    {doctor?.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </div>
              
              {doctor.bio && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">About Doctor</p>
                  <p className="text-sm text-muted-foreground">{doctor.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Form Component */}
          <BookAppointmentForm 
            doctor={doctor}
            currentUser={currentUser}
          />
        </div>

        {/* Right Column - Booking Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Doctor</span>
                  <span className="font-medium">Dr. {doctor.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Speciality</span>
                  <span className="font-medium">{doctor.speciality}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Consultation Type</span>
                  <span className="font-medium">Video Call</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">30 minutes (Extendable)</span>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">Credits Required</span>
                  <span className="font-semibold">2 credits</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Your Credits</span>
                  <span className={`font-semibold ${currentUser.credits < 2 ? 'text-destructive' : 'text-green-600'}`}>
                    {currentUser.credits} credit{currentUser.credits !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="text-base font-semibold">Total Cost</span>
                  <span className="text-lg font-bold">1 consultation</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <p className="text-xs text-center text-muted-foreground">
                By booking, you agree to our Terms of Service and Privacy Policy.
                Consultation will be conducted via secure video call.
              </p>
            </CardFooter>
          </Card>

          {/* Important Notes */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">Important Information</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Appointments must be booked at least 12 hours in advance</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>2 credits = 1 consultation (30 minutes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>No refund for cancellations within 2 hours of appointment</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Have a stable internet connection for video consultation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

