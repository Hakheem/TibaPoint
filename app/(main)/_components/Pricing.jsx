'use client'

import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser, useAuth } from '@clerk/nextjs'
import { useState } from 'react'
import { createCheckoutSession } from '@/actions/checkout'

export default function Pricing() {
  const { user } = useUser()
  const { openSignIn } = useAuth()
  const [loading, setLoading] = useState(null)

  const packages = [
    { 
      name: "Starter",
      badge: "BEST FOR INDIVIDUALS",
      consultations: 5,
      price: 2500,
      originalPrice: null,
      pricePerConsultation: 500,
      features: [
        "Book any verified doctor",
        "Video or in-person visits",
        "Access your medical records anytime",
        "Whatsapp and email support",
        "Valid for 30 days"
      ],
      popular: false
    },
    {
      name: "Family",
      badge: "BEST VALUE",
      consultations: 8,
      price: 3800,
      originalPrice: 4000,
      pricePerConsultation: 475,
      savings: "Save 5%",
      features: [
        "Everything in Starter",
        "Share with family members",
        "Priority booking slots",
        "24/7 chat support",
        "Exclusive health tips & reminders"
      ],
      popular: true
    },
    {
      name: "Wellness",
      badge: "BEST FOR CHRONIC CARE",
      consultations: 10,
      price: 4500,
      originalPrice: 5000,
      pricePerConsultation: 450,
      savings: "Save 10%",
      features: [
        "Everything in Family",
        "Dedicated care coordinator",
        "Quarterly health checkup reminders",
        "Prescription delivery discounts",
        "VIP priority support"
      ],
      popular: false
    }
  ]

  const handleSubscribe = async (packageName) => {
    // Check authentication
    if (!user) {
      openSignIn({
        redirectUrl: `${window.location.origin}/pricing`,
      })
      return
    }

    setLoading(packageName)

    try {
      // Call the server action to create InstaSend checkout
      const result = await createCheckoutSession(packageName)
      
      if (result.success && result.url) {
        // Redirect to InstaSend payment page
        window.location.href = result.url
      } else {
        throw new Error(result.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <section className="relative py-20 bg-linear-to-b from-transparent via-blue-50/30 to-transparent dark:via-slate-900/30">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container padded mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-3">
          <div className="inline-block">
            <Badge className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary dark:bg-teal-500/20 dark:text-teal-300">
              Simple Pricing
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Choose Your{' '}
            <span className="text-gradient-primary">Healthcare Plan</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Transparent pricing. No hidden fees. All plans valid for 1 full year from purchase.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <div className="relative" key={index}>
              {/* Package Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge 
                  className={`text-xs font-bold tracking-wider px-3 py-1.5 ${
                    pkg.name === "Starter" ? "border-blue-200 text-blue-700 dark:border-blue-500/30 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/30" :
                    pkg.name === "Family" ? "border-teal-200 text-teal-700 dark:border-teal-500/30 dark:text-teal-300 bg-teal-300 dark:bg-background" :
                    "border-purple-200 text-purple-700 dark:border-purple-500/30 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/30"
                  }`}
                >
                  {pkg.badge}
                </Badge>
              </div>
              
              <Card className={`relative flex flex-col h-full ${
                pkg.popular 
                  ? 'border-primary dark:border-teal-500 shadow-lg' 
                  : 'border-border hover:border-primary/30 dark:hover:border-teal-500/30'
              } transition-all duration-300 hover:shadow-md overflow-hidden`}>
                
                {/* Gradient for middle card */}
                {pkg.popular && (
                  <>
                    <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10 dark:via-transparent dark:to-transparent" />
                    <div className="absolute -inset-2 bg-linear-to-br from-primary/20 to-blue-400/20 dark:from-teal-500/20 dark:to-teal-300/20 blur-xl opacity-30 pointer-events-none" />
                  </>
                )}

                <CardHeader className="text-center pb-4 pt-7 relative z-10">
                  {/* Package Name */}
                  <CardTitle className="text-xl font-bold text-foreground mb-3">
                    {pkg.name}
                  </CardTitle>

                  {/* Consultations */}
                  <div className="mb-4">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl md:text-5xl font-bold text-foreground">
                        {pkg.consultations}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                        Consultation{pkg.consultations > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="relative">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-2xl md:text-3xl font-bold text-foreground">
                        KSh {pkg.price.toLocaleString()}
                      </span>
                      
                      {/* Slashed Price */}
                      {pkg.originalPrice && (
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-sm text-rose-600 dark:text-rose-400 line-through font-medium">
                            KSh {pkg.originalPrice.toLocaleString()}
                          </span>
                          <Badge className="bg-primary text-white text-[10px] font-bold px-2 py-0.5">
                            {pkg.savings}
                          </Badge>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        KSh {pkg.pricePerConsultation} per consultation
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Features List */}
                <CardContent className="grow py-3 px-6 relative z-10">
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className={`${
                          pkg.popular 
                            ? 'bg-primary/10 dark:bg-teal-500/20 text-primary dark:text-teal-400' 
                            : 'bg-muted text-muted-foreground'
                        } h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span className="text-xs text-foreground leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                {/* Button with Most Popular badge */}
                <div className="px-6 pb-4 pt-2 relative">
                  <div className="relative">
                    {/* Most Popular Badge */}
                    {pkg.popular && (
                      <div className="absolute -top-3 right-0 z-10">
                        <Badge className="bg-gradient-primary text-white text-[10px] font-bold px-2 py-0.5 shadow-sm">
                          <Sparkles className="h-2.5 w-2.5 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => handleSubscribe(pkg.name)}
                      disabled={loading === pkg.name}
                      className={`w-full ${
                        pkg.popular 
                          ? 'bg-gradient-primary hover:opacity-90' 
                          : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 dark:bg-secondary dark:text-secondary-foreground dark:border dark:border-border'
                      }`}
                      size="default"
                    >
                      {loading === pkg.name ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Processing...
                        </>
                      ) : (
                        pkg.popular ? 'Get Started' : `Choose ${pkg.name}`
                      )}
                    </Button>
                  </div>
                </div>
              </Card> 
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12 space-y-4">
          <Badge className="bg-primary/10 text-[#333] dark:text-[#f5f5f5] px-3 py-2 md:px-4 md:py-2 w-fit max-w-sm md:max-w-none mx-auto">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 shrink-0" />
            <span className="text-xs md:text-sm">
              <span className="font-bold text-gradient-primary">New users get 1 FREE consultation</span>
              <span className="hidden sm:inline"> to try our platform (valid for 90 days)</span>
              <span className="sm:hidden"> (90 days)</span>
            </span>
          </Badge>
          
          <p className="text-sm text-muted-foreground">
            ✓ All packages valid for 1 full year from purchase  •  ✓ Secure payment processing  •  ✓ 30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  )
}

