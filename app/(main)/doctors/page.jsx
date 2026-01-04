import React from 'react'
import Link from 'next/link'
import { Search, Stethoscope, Shield, Star, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SPECIALITIES, generateSpecialtySlug } from '@/lib/specialities'

const DoctorsMainPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-linear-to-b from-primary/5 to-transparent py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Find Your Perfect <span className="text-gradient-primary">Doctor</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with certified medical professionals for online consultations. 
              Get expert medical advice from the comfort of your home.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto pt-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Search for doctors by name, speciality, or condition..."
                  className="pl-12 h-12 text-lg border-2 focus:border-primary"
                />
                <Button className="absolute right-2 top-2 h-8 px-4">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties Grid */}
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Browse by <span className="text-gradient-primary">Speciality</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find expert doctors in every medical field. Click on a speciality to view available specialists.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {SPECIALITIES.map((speciality) => {
              const Icon = speciality.icon
              const specialtySlug = generateSpecialtySlug(speciality.value)
              
              return (
                <Link
                  key={speciality.value}
                  href={`/doctors/${specialtySlug}`}
                  className="group"
                >
                  <div className="h-full flex flex-col items-center justify-center p-6 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 cursor-pointer group-hover:shadow-md">
                    <div className={`p-4 rounded-full ${speciality.color.replace('text-', 'bg-')}/10 mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`h-8 w-8 ${speciality.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-center group-hover:text-primary transition-colors">
                      {speciality.value}
                    </h3>
                  </div>
                </Link>
              )
            })}
          </div>
          
          {/* View All Doctors CTA */}
          <div className="text-center mt-12 pt-8 border-t">
            <h3 className="text-2xl font-bold mb-4">Can&apos;t find your speciality?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Browse through all our certified doctors or use the search bar above to find exactly what you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/doctors/all">
                  View All Doctors
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">
                  Need Help Finding?
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 bg-card border-t">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Common Questions</h2>
            <p className="text-muted-foreground">
              Quick answers to help you get started
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-background">
              <h3 className="font-semibold text-lg mb-2">How do online consultations work?</h3>
              <p className="text-muted-foreground">
                Book an appointment, meet your doctor via secure video call, discuss your health concerns, 
                and receive professional medical advice and prescriptions when needed.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-background">
              <h3 className="font-semibold text-lg mb-2">Are the doctors licensed?</h3>
              <p className="text-muted-foreground">
                Yes, all doctors on our platform are fully licensed and verified. 
                We verify credentials, licenses, and professional standing before onboarding.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-background">
              <h3 className="font-semibold text-lg mb-2">Can I get prescriptions?</h3>
              <p className="text-muted-foreground">
                Doctors can provide electronic prescriptions that you can use at any pharmacy. 
                Some controlled substances may require in-person consultation.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-background">
              <h3 className="font-semibold text-lg mb-2">Is my information secure?</h3>
              <p className="text-muted-foreground">
                We use bank-level encryption and comply with healthcare privacy regulations. 
                Your medical information is confidential and protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorsMainPage

