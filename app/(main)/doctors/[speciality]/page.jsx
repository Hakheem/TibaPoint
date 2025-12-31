import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  SPECIALITIES, 
  getSpecialtyByValue, 
  generateSpecialtySlug, 
  slugToDisplayName 
} from '@/lib/specialities'

// This function would fetch doctors by specialty from your database
async function getDoctorsBySpecialty(specialtyName) {
  // In real implementation, you would fetch from database:
  // const doctors = await db.user.findMany({
  //   where: {
  //     role: 'DOCTOR',
  //     speciality: specialtyName,
  //     verificationStatus: 'VERIFIED',
  //     doctorStatus: 'ACTIVE'
  //   },
  //   include: { ... }
  // })
  
  // For now, return mock data
  return {
    specialty: specialtyName,
    doctors: [] // Will be populated with real data
  }
}

// Generate static paths for all specialties during build
export async function generateStaticParams() {
  return SPECIALITIES.map((specialty) => ({
    specialty: generateSpecialtySlug(specialty.value),
  }))
}

// Tell Next.js to dynamically render at runtime
export const dynamicParams = true // Allow dynamic routes not generated at build time
export const revalidate = 3600 // Revalidate every hour

// Metadata for SEO
export async function generateMetadata({ params }) {
  const { specialty: specialtySlug } = await params
  
  if (!specialtySlug || typeof specialtySlug !== 'string') {
    return {
      title: 'Specialty Not Found',
      description: 'The requested medical specialty could not be found.',
    }
  }
  
  const displayName = slugToDisplayName(specialtySlug)
  const specialty = getSpecialtyByValue(displayName)
  
  if (!specialty) {
    return {
      title: 'Specialty Not Found',
      description: 'The requested medical specialty could not be found.',
    }
  }
  
  return {
    title: `${specialty.value} Specialists - Online Consultations`,
    description: `Book appointments with certified ${specialty.value.toLowerCase()} specialists for online consultations. Get expert medical advice from licensed doctors.`,
  }
}

const SpecialtyPage = async ({ params }) => {
  // Await the params object
  const { specialty: specialtySlug } = await params
  
  if (!specialtySlug || typeof specialtySlug !== 'string') {
    notFound()
  }
  
  // Decode the specialty name from URL
  const displayName = slugToDisplayName(specialtySlug)
  
  // Get specialty details - try multiple ways to find it
  let specialty = getSpecialtyByValue(displayName)
  
  // If not found, try to find by comparing slugs
  if (!specialty) {
    specialty = SPECIALITIES.find(s => 
      generateSpecialtySlug(s.value) === specialtySlug
    )
  }
  
  if (!specialty) {
    notFound()
  }
  
  // Fetch doctors (in real app, this would be database call)
  const { doctors } = await getDoctorsBySpecialty(displayName)
  
  const Icon = specialty.icon
  
  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 max-w-6xl py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/doctors" className="text-muted-foreground hover:text-foreground">
              Doctors
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/doctors" className="text-muted-foreground hover:text-foreground">
              Specialties
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{specialty.value}</span>
          </div>
        </div>
      </div>
      
      {/* Specialty Header */}
      <div className="py-8 md:py-12 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${specialty.color.replace('text-', 'bg-')}/10`}>
                <Icon className={`h-10 w-10 ${specialty.color}`} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{specialty.value}</h1>
                <p className="text-lg text-muted-foreground">
                  Connect with certified {specialty.value.toLowerCase()} specialists
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href="/doctors">
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
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Availability</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Available Now</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Next 24 Hours</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Languages</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">English</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Swahili</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">French</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Experience</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">5+ years</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">10+ years</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">15+ years</span>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Clear Filters
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Not sure which doctor to choose? Our team can help you find the right specialist.
                    </p>
                    <Button variant="outline" className="w-full">
                      Get Help Choosing
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder={`Search ${specialty.value.toLowerCase()} doctors by name or location...`}
                    className="h-12 text-lg pl-4 pr-12"
                  />
                  <Button className="absolute right-2 top-2 h-8">
                    Search
                  </Button>
                </div>
              </div>
              
              {/* Tabs */}
              <Tabs defaultValue="all" className="mb-8">
                <TabsList>
                  <TabsTrigger value="all">All Doctors</TabsTrigger>
                  <TabsTrigger value="available">Available Now</TabsTrigger>
                  <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
                  <TabsTrigger value="new">New Doctors</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Doctors Grid */}
              {doctors.length > 0 ? (
                <div className="space-y-6">
                  {/* Map through real doctors here */}
                  <p className="text-center py-12 text-muted-foreground">
                    Loading doctors for {specialty.value}...
                  </p>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold">No {specialty.value} Doctors Available Yet</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        We&apos;re working on adding more {specialty.value.toLowerCase()} specialists to our platform. 
                        Please check back soon or browse other specialties.
                      </p>
                      <div className="pt-4">
                        <Button asChild>
                          <Link href="/doctors">
                            Browse Other Specialties
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Information Section */}
              <div className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6">About {specialty.value}</h2>
                <div className="prose prose-gray max-w-none dark:prose-invert">
                  <p>
                    {specialty.value} specialists are medical doctors who focus on diagnosing, 
                    treating, and preventing conditions related to their field of expertise. 
                    They provide comprehensive medical care and can help with both acute and chronic conditions.
                  </p>
                  <p>
                    Through online consultations, {specialty.value.toLowerCase()} specialists can provide:
                  </p>
                  <ul>
                    <li>Medical advice and second opinions</li>
                    <li>Diagnosis and treatment plans</li>
                    <li>Prescription management</li>
                    <li>Follow-up care and monitoring</li>
                    <li>Referrals to other specialists if needed</li>
                  </ul>
                  <p>
                    All our {specialty.value.toLowerCase()} doctors are licensed, verified, and have extensive 
                    experience in their field. They stay updated with the latest medical advancements 
                    to provide you with the best possible care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecialtyPage

