'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import Image from 'next/image'

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      avatar: "/testimonial1.png",
      quote: "TibaPoint made it so easy to find a pediatrician for my daughter. Booked an appointment in minutes and the doctor was excellent. No more waiting in crowded clinics!",
      name: "Amina K.",
      location: "Nairobi",
      rating: 5
    },
    {
      id: 2,
      avatar: "/testimonial2.png",
      quote: "The video consultation feature is a game-changer. I consulted with a specialist from Mombasa while I was upcountry. Professional service and very affordable.",
      name: "Brian M.",
      location: "Kisumu",
      rating: 5
    },
    {
      id: 3,
      avatar: "/testimonial3.png",
      quote: "Finally, a platform that respects my time. The token system is brilliant—I bought a package and now I book appointments whenever I need them. Highly recommend!",
      name: "Grace W.",
      location: "Eldoret",
      rating: 5
    }
  ]

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background linear */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-50/30 to-transparent dark:via-slate-900/30" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container padded mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-block mb-4">
            <Badge className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs sm:text-sm font-medium text-primary dark:bg-teal-500/20 dark:text-teal-300">
              Testimonials
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Patients{' '}
            <span className="text-linear-primary">Across Kenya</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Hear from real patients who have transformed their healthcare experience
          </p>
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden relative overflow-hidden">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="shrink-0 w-[85vw] snap-center">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
          
          {/* Scroll indicator dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-300"
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}

function TestimonialCard({ testimonial }) {
  return (
    <Card className="h-full border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/20 dark:hover:border-teal-500/30">
      <CardContent className="p-6 md:p-8">
        {/* Avatar & Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 dark:border-teal-500/30">
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{testimonial.name}</h3>
            <p className="text-sm text-muted-foreground">{testimonial.location}</p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        {/* Quote */}
        <div className="relative">
          <svg 
            className="absolute -top-2 -left-2 w-8 h-8 text-primary/10 dark:text-teal-500/20"
            fill="currentColor" 
            viewBox="0 0 32 32"
          >
            <path d="M10 8v6c0 2.2-1.8 4-4 4H2v4h4c4.4 0 8-3.6 8-8V8h-4zm14 0v6c0 2.2-1.8 4-4 4h-4v4h4c4.4 0 8-3.6 8-8V8h-4z" />
          </svg>
          <p className="text-foreground relative z-10 italic">
            "{testimonial.quote}"
          </p>
        </div>

        {/* Bottom accent */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Verified Patient
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

