"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  UserCheck,
  CreditCard,
  Calendar,
  Video,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <UserPlus className="h-6 w-6" />,
      title: "Create Your Account",
      description:
        "Sign up in 60 seconds. Your health journey starts with a secure personal profile.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      number: "02",
      icon: <UserCheck className="h-6 w-6" />,
      title: "Browse & Choose Your Doctor",
      description:
        "Filter by specialty, availability, and patient ratings. Find the perfect match in seconds.",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950/30",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
    {
      number: "03",
      icon: <CreditCard className="h-6 w-6" />,
      title: "Purchase Consultation Credits",
      description:
        "Purchase credit packages that fit your healthcare needs via M-Pesa, card, or PayPal.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      number: "04",
      icon: <Calendar className="h-6 w-6" />,
      title: "Book Appointment",
      description:
        "Choose your preferred date and time and book consultation, no waiting, no phone calls.",
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/30",
      iconColor: "text-pink-600 dark:text-pink-400",
    },
    {
      number: "05",
      icon: <Video className="h-6 w-6" />,
      title: "Video Consultation",
      description:
        "Meet your doctor via secure video from home or in-person. Quality consultations on your terms.",
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      number: "06",
      icon: <FileText className="h-6 w-6" />,
      title: "Medical Documentation",
      description:
        "Access and manage your appointment history, doctor's notes, and medical recommendations.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <section className="relative py-16 bg-linear-to-b from-transparent via-blue-50/30 to-transparent dark:via-slate-900/30">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 dark:bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/20 dark:bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container padded mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16">
          <div className="inline-block mb-4">
            <Badge className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs sm:text-sm font-medium text-primary dark:bg-teal-500/20 dark:text-teal-300">
              How It Works
            </Badge>
          </div>
          <h2 className="text-3xl md: font-bold text-foreground mb-4">
            Your Healthcare Journey in{" "}
            <span className="text-gradient-primary">6 Simple Steps</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Get the care you need without the wait or hassle
          </p>
        </div>

        {/* Desktop/Tablet: Grid Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((step, index) => (
            <StepCardDesktop key={index} step={step} index={index} />
          ))}
        </div>

        {/* Mobile: Carousel Layout */}
        <div className="md:hidden relative overflow-hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {steps.map((step, index) => (
              <div key={index} className="shrink-0 w-[85%] snap-center">
                <StepCardMobile step={step} index={index} />
              </div>
            ))}
          </div>

          {/* Scroll indicator dots */}
          <div className="flex justify-center gap-2 mt-3">
            {steps.map((_, index) => (
              <button
                key={index}
                className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-300"
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 md:mt-12">
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            Ready to start your health journey?
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Link href="/sign-in" className="flex items-center gap-2">
              Book Your First Appointment
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </Button>
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

// Desktop/Tablet Card Component
function StepCardDesktop({ step, index }) {
  return (
    <div className="group relative">
      <div className="relative h-full bg-card rounded-xl md:p-4 lg:p-6 shadow-sm border border-border hover:shadow-md hover:border-primary/20 dark:hover:border-teal-500/30 transition-all duration-300">
        {/* Number Badge */}
        <div
          className={`absolute -top-4 -right-4 w-10 h-10 rounded-full bg-linear-to-br ${step.color} flex items-center justify-center shadow-md`}
        >
          <span className="text-white font-bold text-sm">{step.number}</span>
        </div>

        {/* Icon Container */}
        <div
          className={`mb-4 ${step.bgColor} size-12 rounded-2xl flex items-center justify-center`}
        >
          <div className={step.iconColor}>{step.icon}</div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary dark:group-hover:text-teal-400 transition-colors">
          {step.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>

        {/* Hover Glow Effect */}
        <div
          className={`absolute inset-0 rounded-2xl bg-linear-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
        />
      </div>
    </div>
  );
}

// Mobile Card Component
function StepCardMobile({ step, index }) {
  return (
    <div className="group relative">
      <div className="relative h-full bg-card rounded-xl p-6 mt-6 shadow-sm border border-border hover:shadow-md hover:border-primary/20 dark:hover:border-teal-500/30 transition-all duration-300">
        {/* Number Badge */}
        <div
          className={`absolute -top-3 -right-3 w-9 h-9 rounded-full bg-linear-to-br ${step.color} flex items-center justify-center shadow-md`}
        >
          <span className="text-white font-bold text-xs">{step.number}</span>
        </div>

        {/* Icon Container */}
        <div
          className={`mb-4 ${step.bgColor} size-10 rounded-xl flex items-center justify-center`}
        >
          <div className={step.iconColor}>{step.icon}</div>
        </div>

        {/* Content */}
        <h3 className="text-base font-bold text-foreground mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>

        {/* Hover Glow Effect for mobile */}
        <div
          className={`absolute inset-0 rounded-xl bg-linear-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
        />
      </div>
    </div>
  );
}
