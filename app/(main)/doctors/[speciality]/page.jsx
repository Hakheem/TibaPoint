import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Filter,
  Star,
  MapPin,
  Calendar,
  Clock,
  Search,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDoctorsBySpeciality } from "@/actions/doctors";
import {
  SPECIALITIES,
  getSpecialtyByValue,
  generateSpecialtySlug,
  slugToDisplayName,
} from "@/lib/specialities";

// Generate static paths for all specialties during build
export async function generateStaticParams() {
  return SPECIALITIES.map((specialty) => ({
    speciality: generateSpecialtySlug(specialty.value),
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const specialtySlug = resolvedParams?.speciality;

  if (!specialtySlug) {
    return {
      title: "Specialty Not Found",
    };
  }

  const displayName = slugToDisplayName(specialtySlug);
  const specialty = getSpecialtyByValue(displayName);

  if (!specialty) {
    return {
      title: "Medical Specialists",
    };
  }

  return {
    title: `${specialty.value} Specialists - Online Consultations`,
    description: `Book appointments with certified ${specialty.value.toLowerCase()} specialists for online consultations. Get expert medical advice from licensed doctors.`,
  };
}

const DoctorCard = ({ doctor }) => {
  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/30 border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarImage src={doctor.image} alt={doctor.name} />
              <AvatarFallback className="text-lg font-semibold bg-primary/10">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-1 truncate">
                {doctor.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary" className="font-normal">
                  {doctor.speciality}
                </Badge>
              </CardDescription>
            </div>
          </div>

          {doctor.rating && (
            <div className="flex flex-col items-end shrink-0 ml-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold">{doctor.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                ({doctor.reviewCount || 0} reviews)
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {doctor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {doctor.bio}
          </p>
        )}

        <div className="space-y-2 text-sm">
          {doctor.experience && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {doctor.experience} years experience
              </span>
            </div>
          )}

          {doctor.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{doctor.location}</span>
            </div>
          )}

          {doctor.languages && doctor.languages.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium shrink-0">Languages:</span>
              <span className="truncate">{doctor.languages.join(", ")}</span>
            </div>
          )}
        </div>

        {doctor.nextAvailable && (
          <div className="flex items-center gap-2 text-sm mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            <span className="text-green-600 dark:text-green-400 font-medium">
              Available {doctor.nextAvailable}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-3 pt-0">
        <Button className="flex-1 h-10" variant="outline" asChild>
          <Link href={`/doctors/${doctor.id}`}>View Profile</Link>
        </Button>
        <Button className="flex-1 h-10" asChild>
          <Link href={`/book/${doctor.id}`}>Book Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const SpecialtyPage = async ({ params }) => {
  const resolvedParams = await params;
  const specialtySlug = resolvedParams?.speciality;

  console.log("Specialty slug received:", specialtySlug);

  // If no slug, show error
  if (!specialtySlug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Invalid Specialty</h2>
            <p className="text-muted-foreground mb-6">
              The specialty parameter is missing.
            </p>
            <Button asChild>
              <Link href="/doctors">Browse All Specialties</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = slugToDisplayName(specialtySlug);
  console.log("Display name:", displayName);

  let specialty = getSpecialtyByValue(displayName);

  if (!specialty) {
    specialty = SPECIALITIES.find(
      (s) =>
        generateSpecialtySlug(s.value).toLowerCase() ===
        specialtySlug.toLowerCase()
    );
  }

  console.log("Specialty found:", specialty?.value);

  // If specialty not found, show error
  if (!specialty) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl py-16">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Specialty Not Found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn&apos;t find the specialty &quot;{displayName}&quot;.
                Please browse our available specialties.
              </p>
              <Button asChild>
                <Link href="/doctors">Browse All Specialties</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fetch doctors
  const { doctors, error } = await getDoctorsBySpeciality(specialty.value);

  const Icon = specialty.icon;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="py-8" />

      {/* Specialty Header */}
      <div className="py-8 md:py-12 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-xl ${specialty.color.replace(
                  "text-",
                  "bg-"
                )}/10 border border-${specialty.color.replace("text-", "")}/20`}
              >
                <Icon className={`h-10 w-10 ${specialty.color}`} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {specialty.value}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {doctors && doctors.length > 0
                    ? `${
                        doctors.length
                      } certified ${specialty.value.toLowerCase()} specialist${
                        doctors.length !== 1 ? "s" : ""
                      } available`
                    : `Connect with certified ${specialty.value.toLowerCase()} specialists`}
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary/20 hover:border-primary/40"
            >
              <Link href="/doctors" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Specialties
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Input
                type="search"
                placeholder={`Search ${specialty.value.toLowerCase()} doctors by name or location...`}
                className="h-12 text-lg pl-12 pr-4 border-2 border-primary/20 focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Button className="absolute right-2 top-2 h-8 px-4">
                Search
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5 mb-6">
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <p className="text-destructive font-medium">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctors Grid */}
          {!error && doctors && doctors.length > 0 ? (
            // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : !error ? (
            <Card className="border-primary/20">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    No {specialty.value} Doctors Available Yet
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We&apos;re working on adding more{" "}
                    {specialty.value.toLowerCase()} specialists to our platform.
                    Please check back soon or browse other specialties.
                  </p>
                  <div className="pt-4">
                    <Button asChild>
                      <Link href="/doctors">Browse Other Specialties</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Information Section */}
          <div className="mt-12 pt-8 border-t">
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 lg:max-w-[85%]">
                <h2 className="text-2xl font-bold mb-6">
                  About {specialty.value}
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    {specialty.value} specialists are medical doctors who focus
                    on diagnosing, treating, and preventing conditions related
                    to their field of expertise. They provide comprehensive
                    medical care and can help with both acute and chronic
                    conditions.
                  </p>

                  <p>
                    Through online consultations,{" "}
                    {specialty.value.toLowerCase()} specialists can provide:
                  </p>

                  <div className="space-y-2 pl-1">
                    {[
                      "Medical advice and second opinions",
                      "Diagnosis and treatment plans",
                      "Prescription management",
                      "Follow-up care and monitoring",
                      "Referrals to other specialists if needed",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pl-1">
                    {[
                      "All doctors are licensed and verified",
                      "Extensive experience in their field",
                      "Stay updated with latest medical advancements",
                      "Provide personalized care plans",
                      "Available for virtual consultations",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          <svg
                            className="h-5 w-5 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <p>
                    All our {specialty.value.toLowerCase()} doctors are
                    committed to providing you with the highest quality medical
                    care through secure and convenient virtual consultations.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-1">
                <Card className="border-primary/20 sticky top-24 w-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>  
                      Need Help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Not sure which doctor to choose? Our team can help you
                      find the right specialist.
                    </p>
                    <div className="space-y-3">
                      <Button className="w-full">Get Help Choosing</Button>
                      <Button
                        variant="outline"
                        className="w-full border-primary/20 hover:border-primary/40"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyPage;
