import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Stethoscope, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getCurrentUser } from '@/onboarding'
import { redirect } from 'next/navigation'

export default async function OnboardingMainPage() {
  const user = await getCurrentUser()

  if (user?.role !== 'UNASSIGNED') {
    if (user?.role === 'PATIENT') redirect('/doctors')
    if (user?.role === 'DOCTOR') redirect('/doctor')
    if (user?.role === 'ADMIN') redirect('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Welcome to <span className="text-linear-primary">TibaPoint</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Choose how you'd like to use TibaPoint. 
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 overflow-hidden">
          {/* Patient */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">I'm a Patient</CardTitle>
              <CardDescription className="text-base">
                Book appointments with verified doctors and manage your health
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10">
            

              <Link href="/onboarding/patient" className="block">
                <Button size='lg' className="w-full bg-gradient-primary hover:opacity-90 group">
                  Continue as Patient
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Doctor */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-teal-500/50 group">
            <div className="absolute inset-0 bg-linear-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Stethoscope className="h-7 w-7 text-teal-600" />
              </div>
              <CardTitle className="text-2xl">I'm a Doctor</CardTitle>
              <CardDescription className="text-base">
                Join our platform and grow your practice with online consultations
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10">
             

              <Link href="/onboarding/doctor" className="block">
                <Button size='lg' className="w-full bg-teal-600 hover:bg-teal-700 text-white group">
                  Continue as Doctor
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}


