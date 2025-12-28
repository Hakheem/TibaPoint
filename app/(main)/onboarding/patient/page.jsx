'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { setUserRole } from '@/actions/onboarding'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function PatientOnboardingPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {  
    setLoading(true)

    const formData = new FormData()
    formData.append('role', 'PATIENT')

    const result = await setUserRole(formData)

    if (result.success) {
      router.push(result.redirect)
    } else {
      alert(result.error || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-100px)] m-auto flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            You're all set! Click below to start booking appointments with verified doctors.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">What's included:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 1 FREE consultation (2 credits)</li>
              <li>• Access to 500+ verified doctors</li>
              <li>• Video & in-person appointments</li>
              <li>• Secure medical records</li>
            </ul>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your account...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

