
'use client'

import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PaymentFailedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-red-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Payment Failed
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            We couldn't process your payment
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Common Reasons */}
          <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
            <p className="font-semibold text-sm mb-2">Common reasons for payment failure:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Insufficient funds in account</li>
              <li>Incorrect card details</li>
              <li>Payment timeout or cancelled</li>
              <li>Network connection issues</li>
              <li>Card declined by bank</li>
            </ul>
          </div>

          {/* What to do */}
          <div className="border-t pt-4">
            <p className="font-semibold text-sm mb-2">What you can do:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Check your payment details and try again</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Ensure you have sufficient funds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Try a different payment method</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Contact your bank if issue persists</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => router.push('/pricing')}
              className="w-full bg-gradient-primary"
              size="lg"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </div>

          {/* Support */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our support team
            </p>
            <Button 
              variant="link" 
              className="text-primary"
              onClick={() => router.push('/support')}
            >
              Get Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

