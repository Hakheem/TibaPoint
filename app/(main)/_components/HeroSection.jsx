"use client";

import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-24 py-12 sm:mt-0 sm:py-16 md:pt-30 lg:pt-12 overflow-hidden bg-linear-to-b from-blue-100 via-blue-50 to-transparent dark:from-primary/30 dark:via-primary/10 dark:to-transparent">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -bottom-40 -left-40 size-40 rounded-full bg-primary/5 dark:bg-teal-300/10 blur-2xl" />
      </div>
 
      <div className="relative mx-auto container padded">
        <div className="flex flex-col items-center lg:items-center lg:justify-center">
          <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            {/* Left Content */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="animate-fade-in">
                <Badge className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs sm:text-sm font-medium text-primary dark:bg-teal-500/20 dark:text-teal-300">
                  <Sparkles className="size-4 sm:size-4" />
                  <span>New: Video Consultations Now Available</span>
                </Badge>
              </div>

              <h1 className="text-3xl font-bold lg:leading-14 tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-5xl">
                Your Health,{" "}
                <span className="text-gradient-primary">Deserves Better</span>{" "}Than Long Queues.
              </h1>

              <p className="text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto lg:mx-0">
               Join 10,000+ users accessing quality healthcare on their terms. Book appointments in seconds,  <span className="text-gradient-primary">consult from anywhere,</span> and take control of your health journey
              </p>

              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="group bg-gradient-primary px-6 py-6"
                >
                  <Link href="/onboarding" className="flex items-center">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-6 py-6 dark:bg-secondary dark:text-secondary-foreground dark:border dark:border-border"
                >
                  <Link href="/doctors">Browse Doctors</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground lg:justify-start">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-emerald-500" />
                  <span className="font-medium">500+ Verified Doctors</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-emerald-500" />
                  <span className="font-medium">Same-Day Appointments</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-emerald-500" />
                  <span className="font-medium">Secure & Private</span>
                </div>
              </div>
            </div>

            {/* Right Image Content */}
            <div className="relative mt-8 lg:mt-0">
              {/* Appointment Card - */}
              <div className="absolute left-12 sm:left-20 top-1/4 sm:top-[35%] z-10 animate-float rounded-lg bg-card p-2 shadow-xl sm:rounded-xl sm:p-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 sm:h-8 sm:w-8">
                    <CheckCircle className="h-3 w-3 text-emerald-500 sm:h-4 sm:w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-normal text-muted-foreground sm:text-xs">
                      Appointment
                    </p>
                    <p className="text-[11px] font-medium text-foreground sm:text-sm sm:font-semibold">
                      Confirmed
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Appointment Card */}
              <div
                className="absolute -right-1 sm:-right-4 top-[45%] z-10 animate-float-delayed rounded-lg bg-card p-2 shadow-xl sm:rounded-xl sm:p-3"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-teal-500/20 sm:h-8 sm:w-8">
                    <svg
                      className="h-3 w-3 text-primary dark:text-teal-400 sm:h-4 sm:w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-normal text-muted-foreground sm:text-xs">
                      Next Available
                    </p>
                    <p className="text-[11px] font-medium text-foreground sm:text-sm sm:font-semibold">
                      Today 2PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Card */}
              <div
                className="absolute -bottom-2 left-1/4 z-10 animate-float rounded-md bg-card p-2 shadow-xl sm:p-3 sm:-bottom-4"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex -space-x-1.5 sm:-space-x-2">
                    {/* profile 1 */}
                    <div className="relative h-5 w-5 rounded-full border border-white dark:border-gray-800 overflow-hidden sm:h-7 sm:w-7 sm:border-2">
                      <Image
                        src="/profile1.png"
                        alt="patient 1"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 20px, 28px"
                      />
                    </div>

                    {/* profile 2 */}
                    <div className="relative h-5 w-5 rounded-full border border-white dark:border-gray-800 overflow-hidden sm:h-7 sm:w-7 sm:border-2">
                      <Image
                        src="/profile2.png"
                        alt="patient 2"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 20px, 28px"
                      />
                    </div>

                    {/* profile 3 */}
                    <div className="relative h-5 w-5 rounded-full border border-white dark:border-gray-800 overflow-hidden sm:h-7 sm:w-7 sm:border-2">
                      <Image
                        src="/profile3.png"
                        alt="patient 3"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 20px, 28px"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] font-medium text-foreground sm:text-xs">
                    10K+ profiles
                  </p>
                </div>
              </div>

              {/* Main Image Container */}
              <div className="relative overflow-hidden h-75 sm:h-100 md:h-150">
                <div className="absolute inset-0 bg-linear-to-t from-background/10 via-transparent to-transparent z-10" />
                <Image
                  src="/header_image.png"
                  alt="Professional healthcare consultation"
                  fill
                  priority
                  className="object-cover object-top lg:mt-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Background Glow */}
              <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-2xl bg-linear-to-br from-primary/30 to-blue-400/30 dark:from-teal-500/30 dark:to-teal-300/30 blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 6s ease-in-out infinite 0.5s;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </section>
  );
}
