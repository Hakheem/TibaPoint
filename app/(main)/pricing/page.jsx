import { CheckCircle, Shield, Clock, Users, Zap, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Pricing from '../_components/Pricing'
import Features from '../_components/Features'
import { Badge } from '@/components/ui/badge'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-100 via-blue-50 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent ">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-8 pt-24 md:pt-28 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:bg-teal-500/20 dark:text-teal-300 mb-4">
            <Shield className="h-4 w-4" />
            Trusted by thousands of Kenyans
          </Badge>
          
          <h1 className="text-4xl font-bold mb-6">
            Affordable Healthcare, 
            <span className="text-gradient-primary">
              {' '}On Your Terms
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Get instant access to verified doctors. No hidden fees, no subscriptions.
            Pay only for the consultations you need.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className=" bg-gradient-primary ">
              <Link href="#pricing">
                View Plans & Pricing
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/doctors">
                Browse Doctors
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Value Proposition */}
      <section className=" py-12">
        <div className="container mx-auto padded">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Why Choose TibaPoint?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Verified Doctors Only</h4>
                    <p className="text-muted-foreground">
                      Every doctor is thoroughly vetted and licensed in Kenya.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-blue-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">24/7 Availability</h4>
                    <p className="text-muted-foreground">
                      Book appointments anytime. Doctors available round the clock.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-purple-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1 ">Secure & Private</h4>
                    <p className="text-muted-foreground">
                      End-to-end encrypted consultations. Your health data is protected.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">No Long-term Commitments</h4>
                    <p className="text-muted-foreground">
                      Pay per consultation. No subscriptions, cancel anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="bg-white dark:bg-slate-800 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Heart className="h-10 w-10 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">
                    Try Risk-Free
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600 dark:text-gray-300">New User Bonus</span>
                    <span className="font-bold text-green-600">1 FREE Consultation</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600 dark:text-gray-300">Consultation Duration</span>
                    <span className="font-bold">Up to 45 minutes</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600 dark:text-gray-300">Prescriptions Included</span>
                    <span className="font-bold">Yes, e-prescriptions</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600 dark:text-gray-300">Support</span>
                    <span className="font-bold">24/7 Chat & Email</span>
                  </div>
                </div>
                
                <Button asChild className="w-full mt-8 bg-gradient-primary">
                  <Link href="/doctors">
                    Get Your Free Consultation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section id="pricing" className="   ">
        
        <Pricing />
      
      </section>



      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join thousands of Kenyans who have found convenient, affordable healthcare on TibaPoint.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="" className="bg-gradient-primary">
              <Link href="/sign-up">
                Sign Up Free
              </Link>
            </Button>
            <Button asChild size="lg" variant="accent" className="border-white ">
              <Link href="/doctors">
                See Available Doctors
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-sm opacity-80">Consultations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">200+</div>
              <div className="text-sm opacity-80">Verified Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm opacity-80">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm opacity-80">Availability</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

