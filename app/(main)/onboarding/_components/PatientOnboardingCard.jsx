// components/onboarding/PatientOnboardingCard.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { setUserRole } from '@/actions/onboarding'
import { CheckCircle, Loader2, ArrowLeft, Heart, Calendar, Shield, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function PatientOnboardingCard({ onBack }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)

    const formData = new FormData()
    formData.append('role', 'PATIENT')

    const result = await setUserRole(formData)

    if (result.success) {
      toast.success('Account setup complete', {
        description: 'Your patient account is now ready. You can start booking appointments',
      })
      router.push(result.redirect)
    } else {
      toast.error('Something went wrong', {
        description: result.error || 'Please try again',
      })
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          You are all set. Click below to start booking appointments with verified doctors
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/5 p-3 rounded-lg flex flex-col items-center">
            <Heart className="h-6 w-6 text-primary mb-2" />
            <p className="text-sm font-medium">Health Tracking</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg flex flex-col items-center">
            <Calendar className="h-6 w-6 text-blue-600 mb-2" />
            <p className="text-sm font-medium">Easy Booking</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg flex flex-col items-center">
            <Shield className="h-6 w-6 text-green-600 mb-2" />
            <p className="text-sm font-medium">Verified Doctors</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center">
            <Users className="h-6 w-6 text-purple-600 mb-2" />
            <p className="text-sm font-medium">Family Plans</p>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium">What is included</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• 1 FREE consultation (2 credits)</li>
            <li>• Access to 500+ verified doctors</li>
            <li>• Video and in-person appointments</li>
            <li>• Secure medical records</li>
            <li>• Family package options</li>
            <li>• 24/7 customer support</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your account
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to selection
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

