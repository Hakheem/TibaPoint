// app/doctor/[id]/page.jsx
import { notFound } from 'next/navigation';
import { Calendar, Clock, MapPin, Star, Award, BookOpen, CheckCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { getDoctorPublicProfile } from '@/actions/doctors';
import { checkUser } from '@/lib/checkUser';
import { auth } from '@clerk/nextjs/server';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const doctorId = resolvedParams?.id;
  
  try {
    const { doctor, error } = await getDoctorPublicProfile(doctorId);
    
    if (error || !doctor) {
      return {
        title: 'Doctor Not Found',
        description: 'The requested doctor profile could not be found.',
      };
    }
    
    return {
      title: `Dr. ${doctor.name} - ${doctor.speciality} | MediPass`,
      description: doctor.bio?.substring(0, 160) || `Book online consultation with Dr. ${doctor.name}, ${doctor.speciality} specialist.`,
      openGraph: {
        images: [doctor.imageUrl || '/default-doctor.jpg'],
      },
    };
  } catch {
    return {
      title: 'Doctor Profile',
      description: 'View doctor profile and book appointments.',
    };
  }
}

const ReviewCard = ({ review }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.patient?.imageUrl} />
            <AvatarFallback>{review.patient?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{review.patient?.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-3 text-sm">{review.comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default async function DoctorProfilePage({ params }) {
  const { userId } = await auth();
  const currentUser = userId ? await checkUser() : null;
  
  const resolvedParams = await params;
  const doctorId = resolvedParams?.id;

  const { doctor, error } = await getDoctorPublicProfile(doctorId);

  if (error || !doctor) {
    notFound();
  }

  const initials = doctor.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const canBook = currentUser?.role === 'PATIENT' && currentUser?.credits >= 2;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-linear-to-b from-primary/5 to-transparent py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Doctor Info */}
            <div className="lg:w-2/3">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-lg">
                  <AvatarImage src={doctor.imageUrl} />
                  <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {doctor.speciality}
                      </Badge>
                      <h1 className="text-3xl md:text-4xl font-bold mt-2">Dr. {doctor.name}</h1>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{doctor.rating?.toFixed(1) || '5.0'}</span>
                          <span className="text-muted-foreground">({doctor.totalReviews || 0} reviews)</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-blue-500" />
                          <span>{doctor.experience || 5}+ years experience</span>
                        </div>
                        
                        {doctor.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-500" />
                            <span>{doctor.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {canBook ? (
                        <Button size="lg" className="w-full md:w-auto" asChild>
                          <a href={`/book/${doctor.id}`}>
                            <Video className="h-5 w-5 mr-2" />
                            Book 30-Min Consultation
                          </a>
                        </Button>
                      ) : currentUser ? (
                        <Button size="lg" className="w-full md:w-auto" asChild>
                          <a href={`/book/${doctor.id}`} className="opacity-70 cursor-not-allowed">
                            Need 2 Credits to Book
                          </a>
                        </Button>
                      ) : (
                        <Button size="lg" className="w-full md:w-auto" asChild>
                          <a href="/sign-in?redirect_url=/book-appointment">
                            Sign In to Book
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">About Dr. {doctor.name.split(' ')[0]}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {doctor.bio || `${doctor.name} is a certified ${doctor.speciality} specialist with ${doctor.experience || '5'}+ years of experience. Dedicated to providing exceptional patient care through virtual consultations.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Info Sidebar */}
            <div className="lg:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Availability</div>
                        <div className="text-sm text-muted-foreground">
                          {doctor.isAvailable ? 'Accepting new patients' : 'Currently unavailable'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Consultation Duration</div>
                        <div className="text-sm text-muted-foreground">30 minutes</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Languages</div>
                        <div className="text-sm text-muted-foreground">English, Swahili</div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Consultation Fee</span>
                      <span className="text-2xl font-bold text-primary">2 credits</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      2 credits = 1 consultation (30 minutes)
                    </p>
                  </div>
                  
                  {canBook ? (
                    <Button size="lg" className="w-full" asChild>
                      <a href={`/book/${doctor.id}`}>
                        Book Appointment
                      </a>
                    </Button>
                  ) : currentUser ? (
                    <Button size="lg" className="w-full opacity-70 cursor-not-allowed">
                      Need 2 Credits to Book
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full" asChild>
                      <a href="/sign-in?redirect_url=/book-appointment">
                        Sign In to Book
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-6xl py-8 md:py-12">
        <Tabs defaultValue="reviews" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">Reviews ({doctor.reviewsReceived?.length || 0})</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews" className="space-y-6">
            {doctor.reviewsReceived && doctor.reviewsReceived.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Patient Reviews</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold">{doctor.rating?.toFixed(1) || '5.0'}</span>
                      <span className="text-muted-foreground">({doctor.totalReviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {doctor.reviewsReceived.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Dr. {doctor.name} doesn&apos;t have any reviews yet. Be the first to share your experience!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Consultation Process</h4>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold">1</span>
                      </div>
                      <span>Book 30-minute appointment by selecting date and time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold">2</span>
                      </div>
                      <span>Receive confirmation and 2 credits will be deducted</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold">3</span>
                      </div>
                      <span>Join 30-minute video consultation at scheduled time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold">4</span>
                      </div>
                      <span>Receive prescription and notes after consultation</span>
                    </li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {['General Consultation', 'Diagnosis', 'Treatment Planning', 'Follow-up Care', 'Medical Advice'].map((expertise) => (
                      <Badge key={expertise} variant="outline">
                        {expertise}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Important Information</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>All consultations are via secure video call</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>You need 2 credits for each 30-minute consultation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Cancel at least 2 hours before for partial refund</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Have a stable internet connection for video consultation</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Book Now CTA */}
        <div className="mt-12 text-center">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Consult with Dr. {doctor.name}?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Book a 30-minute video consultation to discuss your health concerns and receive professional medical advice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {canBook ? (
                  <Button size="lg" asChild>
                    <a href={`/book/${doctor.id}`}>
                      <Video className="h-5 w-5 mr-2" />
                      Book 30-Minute Consultation
                    </a>
                  </Button>
                ) : currentUser ? (
                  <Button size="lg" asChild>
                    <a href="/pricing">
                      Purchase Credits to Book
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" asChild>
                    <a href="/sign-in?redirect_url=/book-appointment">
                      Sign In to Book Appointment
                    </a>
                  </Button>
                )}
                <Button size="lg" variant="outline" asChild>
                  <a href="/doctors">
                    Browse Other Doctors
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

