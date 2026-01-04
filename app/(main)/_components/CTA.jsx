'use client'

import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="relative pt-16 pb-0 md:pb-0 lg:pb-16  mt-12 md:mt-14 lg:mt-24 mb-8 container max-w-6xl mx-auto overflow-visible lg:rounded-2xl">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-teal-500 dark:from-primary/90 dark:via-blue-600/90 dark:to-teal-500/90 lg:rounded-2xl" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 lg:rounded-2xl">
        <div className="absolute inset-0 lg:rounded-2xl" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="container padded mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:items-center">
          
          {/* Text & Buttons */}
          <div className="z-20 text-center lg:text-left">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#f5f5f5]">
                Ready to Experience Hassle Free Healthcare?
              </h2>
              <p className="text-base md:text-lg  text-white/90">
                Join thousands of users who trust TibaPoint for quality medical care.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
              <Link href="/sign-up">
                <Button 
                  size="lg" 
                  className="bg-[#f5f5f5] text-[#333] hover:bg-[#f6f6f6] transition-all duration-300  text-base  font-semibold group h-12 px-6 md:px-px-8 "
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link href="/contact">
                <Button 
                  size="lg"
                  variant="secondary"
                  className="border-2 border-white/10 hover:border-white/30 bg-white/10 text-white hover:bg-white/10 transition-all duration-300 text-base font-semibold h-12 px-6 md:px-px-8 "
                >
                  Talk to Sales
                  
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 md:gap-6 mt-8 text-white/90 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-3 md:size-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-3 md:size-4" />
                <span>2-minute setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-3 md:size-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right Column: Image Container */}
          <div className="relative overflow-visible">
            <div className="relative lg:absolute bottom-0 lg:bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[500px] md:max-w-[500px] lg:max-w-[700px] h-[350px] md:h-[400px] lg:h-[600px]">
              <div className="relative w-full h-full lg:h-[150%]">
                {/* Mobile/Tablet */}
                <div className="lg:hidden ">
                  <Image
                    src="/male_doc1.png"
                    alt="Professional doctor"
                    fill
                    className="object-contain object-bottom"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 50vw"
                    priority
                  />
                </div>
                {/* Desktop: Full opacity */}
                <div className="hidden lg:block">
                  <Image
                    src="/male_doc1.png"
                    alt="Professional doctor"
                    fill
                    className="object-contain object-bottom"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </div>
            
            {/* Optional decorative element */}
            <div className="absolute -inset-8 bg-gradient-to-t from-white/5 to-transparent rounded-full blur-2xl opacity-30 pointer-events-none hidden lg:block" />
          </div>
        </div>
      </div>
    </section>
  )
}

