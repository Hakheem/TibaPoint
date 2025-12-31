"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Calendar, Video, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      avatar: "/testimonial3.png",
      quote:
        "Found a pediatrician for my daughter in minutes. The video consultation was smooth, and the doctor was incredibly thorough. No more clinic queues.",
      name: "Amina K.",
      location: "Nairobi",
      rating: 5,
      treatment: "Pediatric Consultation",
      type: "video",
      time: "50 min consultation",
    },
    {
      id: 2,
      avatar: "/testimonial1.png",
      quote:
        "Consulted with a diabetes specialist while upcountry. The prescription was sent to me. TibaPoint saved me an 8-hour journey.",
      name: "Brian O.",
      location: "Kisumu",
      rating: 5,
      treatment: "Diabetes Management",
      type: "video",
      time: "30 min consultation",
    },
    {
      id: 3,
      avatar: "/testimonial2.png",
      quote:
        "The credit system is brilliant, purchased a package and booked appointments on-demand. My therapist has been consistent and supportive throughout.",
      name: "Grace W.",
      location: "Jinja",
      rating: 5,
      treatment: "Mental Wellness",
      type: "in-person",
      time: "1hr session",
    },
  ];

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <div className="container padded mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 ">
          <div className="inline-block mb-4">
            <Badge className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs sm:text-sm font-medium text-primary dark:bg-teal-500/20 dark:text-teal-300">
              <Star className="h-3 w-3" />
              Real Patient Stories
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Healthcare That{" "}
            <span className="text-gradient-primary">Patients Trust</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-xl text-center mx-auto ">
            From quick consultations to ongoing care see how TibaPoint is
            transforming peoples' health journeys
          </p>
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Tablet & Mobile: Carousel */}
        <div className="lg:hidden relative overflow-hidden">
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-2">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="shrink-0 w-[80vw] md:w-[60%] snap-center"
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          {/* Scroll indicator dots  */}
          <div className="flex justify-center gap-2 mt-6 md:hidden">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-300"
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Tablet scroll hint */}
          <div className="hidden md:flex justify-center mt-6">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="animate-pulse">←</span>
              Scroll to see more testimonials
              <span className="animate-pulse">→</span>
            </p>
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
  );
}

function TestimonialCard({ testimonial }) {
  const consultationTypeIcon =
    testimonial.type === "video" ? (
      <Video className="h-3 w-3" />
    ) : (
      <MessageCircle className="h-3 w-3" />
    );

  const consultationTypeText =
    testimonial.type === "video" ? "Video Consultation" : "In Person";

  return (
    <Card className="h-full border border-border hover:shadow-md transition-all duration-300 hover:border-primary/20 dark:hover:border-teal-500/30 group">
      <CardContent className="p-6">
        {/* Top Section: Avatar & Basic Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 dark:border-teal-500/30 group-hover:border-primary/40 dark:group-hover:border-teal-500/50 transition-colors">
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-foreground">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {testimonial.location}
                </p>
              </div>
              {/* Consultation Type Badge */}
              <Badge variant="outline" className="text-[10px] px-2 py-1">
                {consultationTypeIcon}
                <span className="ml-1">{consultationTypeText}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {testimonial.rating}.0
          </span>
        </div>

        {/* Quote */}
        <div className="mb-6">
          <p className="text-foreground leading-relaxed">
            "{testimonial.quote}"
          </p>
        </div>

        {/* Bottom Section: Treatment Details */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                {testimonial.treatment}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {testimonial.time}
              </div>
            </div>

            {/* Verified Patient Badge */}
            <Badge className="text-[10px] bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-300 px-2 py-0.5">
              ✓ Verified Patient
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
