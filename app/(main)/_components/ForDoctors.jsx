"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ForDoctors() {
  const benefits = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Expand Your Reach",
      description:
        "Access a growing network of patients looking for trusted healthcare providers.",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Smart Scheduling",
      description:
        "Seamless appointment management with automated reminders and real-time availability updates.",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/30",
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "Transparent Earnings",
      description:
        "Keep more of your earnings with our competitive 10% commission and guaranteed weekly payouts.",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Build Your Brand",
      description:
        "Create a verified professional profile that highlights your qualifications, experience, and patient reviews.",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Patient Insights",
      description:
        "Actionable analytics dashboard showing patient feedback, appointment trends, and revenue performance.",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Verified Badge",
      description:
        "Earn a verified credential badge that builds immediate trust and distinguishes you as a certified professional.",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    },
  ];

  return (
    <section className="relative py-16 md:py-20 bg-linear-to-b from-transparent via-teal-50/30 to-transparent dark:via-teal-950/10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
      </div>


<div className='text-center mx-auto max-w-2xl md:max-w-3xl lg:max-w-4xl space-y-3 mb-8 '>

  {/* Badge */}
  <div className="text-center justify-center">
    <Badge className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs sm:text-sm font-medium text-primary dark:bg-teal-500/20 dark:text-teal-300">
      For Healthcare Providers
    </Badge>
  </div>

  {/* Title */}
  <div className="text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
      Your Leading{" "}
      <span className="text-gradient-primary">
        Healthcare Platform
      </span>
    </h2>
    <p className="text-base  text-muted-foreground mx-auto max-w-2xl md:max-w-3xl">
      Join thousands of medical professionals who are enhancing
      patient care while optimizing their practice management with our
      purpose-built healthcare platform.
    </p>
  </div>
</div>

      <div className="container padded mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow border border-border">
              {/* Placeholder */}
              <div className="absolute inset-0 bg-linear-to-br from-teal-500/20 via-blue-500/10 to-transparent" />

              {/* Placeholder icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-teal-50 dark:bg-teal-950/30 p-8 rounded-2xl">
                  <Award className="h-24 w-24 text-teal-600 dark:text-teal-400" />
                </div>
              </div>

              <Image
                src="/doctors.png"
                alt="Professional doctor using TibaPoint"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Stats Cards */}
            {/* <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-sm border border-border">
              <p className="text-2xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div> */}

            <div className="absolute -top-6 -right-6 bg-card rounded-xl p-4 shadow-sm border border-border">
              <p className="text-2xl font-bold text-success">12%</p>
              <p className="text-sm text-muted-foreground">Commission</p>
            </div>

              {/* CTA Button */}
        <div className="text-center absolute -bottom-6 -left-6">
          <Button
            size="lg"
            className="inline-flex items-center justify-center gap-2 py-6 bg-gradient-primary font-medium duration-300 "
          >
            Get Verified & Start Seeing Patients
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

            {/* Glow effect */}
            <div className="absolute -inset-8 bg-linear-to-br from-teal-500/20 to-blue-500/20 rounded-3xl blur-3xl -z-10 opacity-50" />
          </div>

          {/* Right */}
          <div className="space-y-6 order-1 lg:order-2">
          

            {/* Mobile: Grid layout (phones) */}
            <div className="block md:hidden">
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="group flex gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/20 dark:hover:border-teal-500/30 hover:shadow-md transition-all duration-300"
                  >
                    {/* Icon Container - Hidden on phones */}
                    <div
                      className={`${benefit.bgColor} h-10 w-10 rounded-lg hidden sm:flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className={benefit.color}>{benefit.icon}</div>
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm">
                        {benefit.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tablet: Slider */}
            <div className="hidden md:block lg:hidden">
              <div className="relative overflow-hidden">
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="shrink-0 w-[35%] snap-center">
                      <div className="group flex gap-3 p-6 rounded-xl bg-card border border-border hover:border-primary/20 dark:hover:border-teal-500/30 hover:shadow-md transition-all duration-300 h-full">
                        {/* Icon Container */}
                        <div
                          className={`${benefit.bgColor} h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <div className={benefit.color}>{benefit.icon}</div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground mb-1 text-base">
                            {benefit.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scroll indicator dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {benefits.map((_, index) => (
                    <button
                      key={index}
                      className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-300"
                      aria-label={`Go to benefit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop: Grid layout  */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="group flex gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/20 dark:hover:border-teal-500/30 hover:shadow-md transition-all duration-300"
                  >
                    {/* Icon Container */}
                    <div
                      className={`${benefit.bgColor} h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className={benefit.color}>{benefit.icon}</div>
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-base">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
