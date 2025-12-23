'use client'

import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Pricing() {
  const packages = [
    {
      name: "Starter",
      badge: "BEST FOR INDIVIDUALS",
      tokens: 5,
      price: 2500,
      originalPrice: null,
      pricePerToken: 500,
      features: [
        "Book any doctor",
        "Video or in-person consultations",
        "Access medical records",
        "Email support",
        "Never expires"
      ],
      popular: false,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      name: "Family",
      badge: "BEST VALUE",
      tokens: 15,
      price: 6750,
      originalPrice: 7500,
      pricePerToken: 450,
      savings: "Save 10%",
      features: [
        "Everything in Starter",
        "Share tokens with family",
        "Priority booking",
        "24/7 chat support",
        "Exclusive health tips"
      ],
      popular: true,
      gradient: "from-teal-500 to-emerald-500"
    },
    {
      name: "Wellness",
      badge: "BEST FOR CHRONIC CARE",
      tokens: 30,
      price: 12000,
      originalPrice: 15000,
      pricePerToken: 400,
      savings: "Save 20%",
      features: [
        "Everything in Family",
        "Dedicated care coordinator",
        "Quarterly health checkup reminder",
        "Prescription delivery discount",
        "VIP support"
      ],
      popular: false,
      gradient: "from-purple-500 to-purple-600"
    }
  ]

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-slate-900/30">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container padded mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-block mb-4">
            <Badge variant="outline" className="text-xs md:text-sm font-semibold tracking-wider uppercase border-primary/20 dark:border-teal-500/30">
              Simple Pricing
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your{' '}
            <span className="text-gradient-primary">Token Package</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            No subscriptions. No expiry dates. Just flexible healthcare access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <Card 
              key={index} 
              className={`relative flex flex-col ${
                pkg.popular 
                  ? 'border-primary dark:border-teal-500 shadow-xl scale-105 md:scale-110 z-10' 
                  : 'border-border hover:border-primary/50 dark:hover:border-teal-500/50'
              } transition-all duration-300 hover:shadow-lg`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-white px-4 py-1.5 shadow-lg">
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                {/* Package Badge */}
                <Badge variant="secondary" className="mb-4 text-xs font-bold tracking-wider w-fit mx-auto">
                  {pkg.badge}
                </Badge>

                {/* Package Name */}
                <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                  {pkg.name}
                </CardTitle>

                {/* Tokens */}
                <div className="mb-4">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">
                    {pkg.tokens}
                  </span>
                  <span className="text-lg text-muted-foreground ml-2">Tokens</span>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-foreground">
                      KSh {pkg.price.toLocaleString()}
                    </span>
                    {pkg.savings && (
                      <Badge variant="outline" className="text-success border-success/50 font-semibold">
                        {pkg.savings}
                      </Badge>
                    )}
                  </div>
                  {pkg.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      KSh {pkg.originalPrice.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    KSh {pkg.pricePerToken} per token
                  </p>
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                {/* Features List */}
                <ul className="space-y-3">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`${
                        pkg.popular 
                          ? 'bg-primary/10 dark:bg-teal-500/20 text-primary dark:text-teal-400' 
                          : 'bg-muted text-muted-foreground'
                      } h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Link href="/sign-up" className="w-full">
                  <Button 
                    className={`w-full ${
                      pkg.popular 
                        ? 'bg-gradient-primary hover:opacity-90' 
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    size="lg"
                  >
                    {pkg.popular ? 'Get Started' : `Get ${pkg.name}`}
                  </Button>
                </Link>
              </CardFooter>

              {/* Decorative gradient */}
              {pkg.popular && (
                <div className={`absolute -inset-1 bg-gradient-to-r ${pkg.gradient} opacity-20 blur-xl -z-10 rounded-lg`} />
              )}
            </Card>
          ))}
        </div>

        {/* Bottom Text */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          All packages include secure payment processing and full refund protection
        </p>
      </div>
    </section>
  )
}

