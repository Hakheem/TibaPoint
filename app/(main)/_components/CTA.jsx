'use client'

import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-teal-500 dark:from-primary/90 dark:via-blue-600/90 dark:to-teal-500/90" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="container padded mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <div className="space-y-6 mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Ready to Experience Hassle-Free Healthcare?
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of Kenyans who trust TibaPoint for quality medical care.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/sign-up">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-xl px-8 py-6 text-base md:text-lg font-semibold group"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/contact">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 px-8 py-6 text-base md:text-lg font-semibold"
              >
                Talk to Sales
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-white/90 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="grid grid-cols-3 gap-6 md:gap-8 max-w-2xl mx-auto">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">10K+</p>
                <p className="text-xs md:text-sm text-white/80">Happy Patients</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">500+</p>
                <p className="text-xs md:text-sm text-white/80">Verified Doctors</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">4.9/5</p>
                <p className="text-xs md:text-sm text-white/80">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

