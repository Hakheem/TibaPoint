'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Stethoscope, ArrowRight, X, ArrowLeft } from 'lucide-react'
import PatientOnboardingCard from './_components/PatientOnboardingCard'
import DoctorOnboardingForm from '@/components/forms/DoctorOnboardingForm'
import { toast } from 'sonner'

export default function OnboardingMainPage() {
  const [step, setStep] = useState('select') 

  const handlePatientSelect = () => {
    setStep('patient')
  }

  const handleDoctorSelect = () => {
    setStep('doctor')
  }

  const handleBack = () => {
    setStep('select')
  }

  // patient onboarding card
  if (step === 'patient') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to selection
            </Button>
          </div>
          <PatientOnboardingCard onBack={handleBack} />
        </div>
      </div>
    )
  }

  // doctor onboarding form
  if (step === 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to selection
            </Button>
          </div>
          <DoctorOnboardingForm onBack={handleBack} />
        </div>
      </div>
    )
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
            Choose how you would like to use TibaPoint
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 overflow-hidden">
          {/* Patient Card */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">I am a Patient</CardTitle>
              <CardDescription className="text-base">
                Book appointments with verified doctors and manage your health
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10">
              <Button
                size="lg"
                onClick={handlePatientSelect}
                className="w-full bg-gradient-primary hover:opacity-90 group"
              >
                Continue as Patient
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Doctor Card */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-teal-500/50 group">
            <div className="absolute inset-0 bg-linear-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Stethoscope className="h-7 w-7 text-teal-600" />
              </div>
              <CardTitle className="text-2xl">I am a Doctor</CardTitle>
              <CardDescription className="text-base">
                Join our platform and grow your practice with online consultations
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10">
              <Button
                size="lg"
                onClick={handleDoctorSelect}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white group"
              >
                Continue as Doctor
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

       
      </div>
    </div>
  )
}

