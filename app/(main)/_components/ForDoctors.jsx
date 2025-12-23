'use client'

import { TrendingUp, Calendar, DollarSign, Award, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ForDoctors() {
  const benefits = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Expand Your Reach",
      description: "Connect with thousands of patients actively seeking care",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Smart Scheduling",
      description: "Automated calendar management and appointment reminders",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/30"
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "Transparent Earnings",
      description: "Weekly payouts with clear commission structure",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Build Your Brand",
      description: "Showcase your expertise with a professional profile",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Patient Insights",
      description: "Track your performance with detailed analytics",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30"
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Verified Badge",
      description: "Stand out with our doctor verification system",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30"
    }
  ]

  return (
    <section className="relative py-16 md:py-24 bg-linear-to-b from-transparent via-teal-50/30 to-transparent dark:via-teal-950/10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container padded mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border">
              {/* Placeholder linear */}
              <div className="absolute inset-0 bg-linear-to-br from-teal-500/20 via-blue-500/10 to-transparent" />
              
              {/* Placeholder icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-teal-50 dark:bg-teal-950/30 p-8 rounded-2xl">
                  <Award className="h-24 w-24 text-teal-600 dark:text-teal-400" />
                </div>
              </div>

              {/* Uncomment when you have image:
              <Image
                src="/doctor-professional.png"
                alt="Professional doctor using TibaPoint"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              */}
            </div>

            {/* Stats Cards */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-xl border border-border">
              <p className="text-3xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Active Doctors</p>
            </div>

            <div className="absolute -top-6 -right-6 bg-card rounded-xl p-4 shadow-xl border border-border">
              <p className="text-3xl font-bold text-success">15%</p>
              <p className="text-sm text-muted-foreground">Commission</p>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-8 bg-linear-to-br from-teal-500/20 to-blue-500/20 rounded-3xl blur-3xl -z-10 opacity-50" />
          </div>

          {/* Right - Content */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Badge */}
            <div className="inline-block">
              <span className="text-xs md:text-sm font-semibold tracking-wider uppercase text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-4 py-2 rounded-full">
                For Healthcare Providers
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Join Kenya's Leading{' '}
                <span className="text-linear-primary">Healthcare Platform</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Grow your practice, reach more patients, and manage appointments effortlessly.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group flex gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/20 dark:hover:border-teal-500/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`${benefit.bgColor} h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={benefit.color}>
                      {benefit.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1 text-sm md:text-base">
                      {benefit.title}
                    </h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register-doctor">
                <button className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-primary text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                  Register as a Doctor
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              
              <Link href="/doctor-signin">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary dark:border-teal-500 text-primary dark:text-teal-400 rounded-lg font-semibold hover:bg-primary/5 dark:hover:bg-teal-500/10 transition-all duration-300 w-full sm:w-auto">
                  Sign in to Dashboard →
                </button>
              </Link>
            </div>

            {/* Small text */}
            <p className="text-xs text-muted-foreground">
              Already registered?{' '}
              <Link href="/doctor-signin" className="text-primary dark:text-teal-400 hover:underline font-medium">
                Sign in to your dashboard
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">10K+</p>
              <p className="text-sm text-muted-foreground">Monthly Bookings</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">500+</p>
              <p className="text-sm text-muted-foreground">Registered Doctors</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">4.9/5</p>
              <p className="text-sm text-muted-foreground">Doctor Rating</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">24/7</p>
              <p className="text-sm text-muted-foreground">Platform Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

