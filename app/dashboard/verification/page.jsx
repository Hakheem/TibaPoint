import React, { Suspense } from 'react'
import { checkUser } from '@/lib/checkUser'
import { Shield, Clock, XCircle, CheckCircle, FileText, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ResubmissionForm from '@/components/forms/DoctorResubmissionForm'

export const metadata = {
  title: "Verification Status - TibaPoint",
  description: "Check your doctor verification status", 
}

const DoctorVerificationPage = async () => {
  const user = await checkUser() 

  if (!user) redirect("/sign-in")
  
  // If user is not a doctor, redirect
  if (user.role !== "DOCTOR") {
    redirect("/")
  }

  // If doctor is already verified, redirect to dashboard
  if (user.verificationStatus === "VERIFIED") {
    redirect("/dashboard")
  }

  const getStatusConfig = (status) => {
    switch(status) {
      case "PENDING":
        return {
          icon: Clock,
          title: "Verification in Progress",
          description: "We're currently reviewing your credentials and documents. This process usually takes 1-3 business days.",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          iconColor: "text-amber-600",
          statusLabel: "Under Review",
          tips: [
            "Make sure your credentials are clear and readable",
            "Ensure your license number is correct and active",
            "Double-check your contact information is up to date",
            "Keep an eye on your email for updates from our team"
          ],
          nextSteps: [
            "You can still complete your profile while waiting",
            "Review our doctor guidelines and policies",
            "Set up your availability for appointments"
          ]
        }
      case "REJECTED":
        return {
          icon: XCircle,
          title: "Verification Request Rejected",
          description: "Your verification request has been rejected. Please review the issues below and update your information.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          statusLabel: "Rejected",
          tips: [
            "Common reasons for rejection:",
            "• Unclear or expired credentials",
            "• Invalid or inactive license number",
            "• Missing required documents (ID, certificates)",
            "• Information mismatch with official records",
            "• Insufficient experience in your field"
          ],
          nextSteps: [
            "Update your profile information below",
            "Upload clearer credential documents",
            "Verify your license number with the relevant board",
            "Contact support if you need clarification"
          ]
        }
      default:
        return {
          icon: Clock,
          title: "Verification Status",
          description: "Your verification status is being processed.",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "text-gray-600",
          statusLabel: "Processing",
          tips: [],
          nextSteps: []
        }
    }
  }

  const statusConfig = getStatusConfig(user.verificationStatus)
  const Icon = statusConfig.icon

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 pb-8 pt-16 md:pt-24 lg:pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Shield className="size-8 md:size-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Doctor Verification Status
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your verification status and access next steps
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Status Card */}
          <div className="lg:col-span-2">
            <Card className={`${statusConfig.borderColor} border overflow-hidden`}>
              <CardHeader className={`${statusConfig.bgColor} p-6`}>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-white border ${statusConfig.borderColor}`}>
                        <Icon className={`w-8 h-8 ${statusConfig.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-2xl ${statusConfig.color} mb-1`}>
                          {statusConfig.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {statusConfig.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <div className={`px-4 py-2 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor} whitespace-nowrap`}>
                      <span className={`font-semibold text-sm ${statusConfig.color}`}>
                        {statusConfig.statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Status Details Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-primary" />
                        Your Information
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500 mb-1">Full Name</p>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                        </div>
                        {user.speciality && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Speciality</p>
                            <p className="font-semibold text-gray-900">{user.speciality}</p>
                          </div>
                        )}
                        {user.licenseNumber && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">License Number</p>
                            <p className="font-semibold text-gray-900 font-mono">{user.licenseNumber}</p>
                          </div>
                        )}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500 mb-1">Member Since</p>
                          <p className="font-semibold text-gray-900">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                        {statusConfig.tips.length > 0 ? 'Important Notes' : 'What to Expect'}
                      </h3>
                      <div className="space-y-3">
                        {statusConfig.tips.map((tip, index) => (
                          <div key={index} className="flex items-start p-3 bg-amber-50/50 rounded-lg">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            </div>
                            <p className="ml-3 text-gray-700">{tip}</p>
                          </div>
                        ))}
                        {statusConfig.tips.length === 0 && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-gray-700">
                              Our verification team will review your submission within 1-3 business days. 
                              You'll receive an email notification once your status is updated.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps Section */}
                {statusConfig.nextSteps.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {statusConfig.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <span className="text-primary font-semibold">{index + 1}</span>
                          </div>
                          <p className="text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resubmission Form (only shown for rejected status) */}
                {user.verificationStatus === "REJECTED" && (
                  <div className="mt-8 pt-8 border-t">
                    <div className="flex items-center mb-6">
                      <RefreshCw className="h-6 w-6 text-primary mr-2" />
                      <h3 className="text-xl font-semibold">Resubmit Your Verification</h3>
                    </div>
                    
                    <Suspense fallback={
                      <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading form...</span>
                      </div>
                    }>
                      <ResubmissionForm 
                        currentUser={user}
                        onBack={() => {/* handle back if needed */}}
                      />
                    </Suspense>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Verification Process Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Profile Creation</p>
                      <p className="text-sm text-muted-foreground">Complete basic information</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${statusConfig.bgColor} flex items-center justify-center mr-3`}>
                      <Icon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                    </div>
                    <div>
                      <p className="font-medium">Document Review</p>
                      <p className="text-sm text-muted-foreground">
                        {user.verificationStatus === "PENDING" 
                          ? "Under review (1-3 days)" 
                          : "Review completed"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Shield className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">Verified Access</p>
                      <p className="text-sm text-gray-400">Full platform access</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Assistance?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Email Support</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      verification@tibapoint.com
                    </p>
                    <p className="text-xs text-blue-600">
                      Response time: 24-48 hours
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Business Hours</h4>
                    <p className="text-sm text-gray-700">
                      Monday - Friday: 9AM - 5PM EAT
                    </p>
                  </div>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/support">
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DoctorVerificationPage


