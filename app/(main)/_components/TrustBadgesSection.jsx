"use client";

import { Users, Star, Shield, Stethoscope, Heart } from "lucide-react";

export default function TrustBadgesSection() {
  const trustStats = [
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      label: "10,000+",
      subtitle: "Happy Patients",
      gradient: "from-blue-500 to-teal-400",
    },
    {
      icon: <Star className="h-5 w-5 text-yellow-500" />,
      label: "4.9/5",
      subtitle: "Average Rating",
      gradient: "from-yellow-500 to-orange-400",
    },
    {
      icon: <Stethoscope className="h-5 w-5 text-emerald-500" />,
      label: "300+",
      subtitle: "Verified Doctors",
      gradient: "from-emerald-500 to-green-400",
    },
    {
      icon: <Heart className="h-5 w-5 text-red-500" />,
      label: "50+",
      subtitle: "Specialties",
      gradient: "from-red-500 to-pink-400",
    },
    {
      icon: <Shield className="h-5 w-5 text-indigo-500" />,
      label: "100%",
      subtitle: "Secure & Private",
      gradient: "from-indigo-500 to-purple-400",
    },
  ];

  return (
    <>
      {/* Desktop Marquee Container */}
      <div className="hidden md:block relative overflow-hidden my-20 bg-linear-to-b from-transparent via-blue-50/30 to-transparent dark:via-slate-900/30 ">
        <div className="container max-w-5xl mx-auto">
          {/* Stats Grid */}
          <div className="flex justify-between items-start px-4">
            {trustStats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="relative mb-3">
                  <div
                    className={`absolute inset-0 bg-linear-to-r ${stat.gradient} opacity-10 blur-xl rounded-full`}
                  />
                  <div className="relative h-12 w-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="h-5 w-5 flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                </div>
                {/* Texts  */}
                <div className="text-center w-full">
                  <div className="h-7 flex items-center justify-center">
                    <p className="text-lg font-semibold leading-tight">
                      {stat.label}
                    </p>
                  </div>
                  <div className="h-5 flex items-center justify-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Marquee Version */}
      <div className="md:hidden relative overflow-hidden  py-10">
        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          {/* First Marquee */}
          <div className="flex animate-marquee whitespace-nowrap py-2">
            {trustStats.map((stat, index) => (
              <div key={`marquee1-${index}`} className="mx-3 shrink-0">
                <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="shrink-0">
                    <div className="h-8 w-8 rounded-full bg-linear-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <div className="h-5 w-5 flex items-center justify-center">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                  <div className="min-w-25">
                    <div className="h-5 flex items-center">
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                        {stat.label}
                      </p>
                    </div>
                    <div className="h-4 flex items-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                        {stat.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {trustStats.map((stat, index) => (
              <div key={`marquee1-dup-${index}`} className="mx-3 shrink-0">
                <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="shrink-0">
                    <div className="h-8 w-8 rounded-full bg-linear-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <div className="h-5 w-5 flex items-center justify-center">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                  <div className="min-w-25">
                    <div className="h-5 flex items-center">
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                        {stat.label}
                      </p>
                    </div>
                    <div className="h-4 flex items-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                        {stat.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Marquee (reversed for better effect) */}
          <div className="flex animate-marquee-reverse whitespace-nowrap py-2">
            {trustStats
              .slice()
              .reverse()
              .map((stat, index) => (
                <div key={`marquee2-${index}`} className="mx-3 shrink-0">
                  <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="shrink-0">
                      <div className="h-8 w-8 rounded-full bg-linear-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                        <div className="h-5 w-5 flex items-center justify-center">
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                    <div className="min-w-25">
                      <div className="h-5 flex items-center">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          {stat.label}
                        </p>
                      </div>
                      <div className="h-4 flex items-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                          {stat.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {/* Duplicate for seamless loop */}
            {trustStats
              .slice()
              .reverse()
              .map((stat, index) => (
                <div key={`marquee2-dup-${index}`} className="mx-3 shrink-0">
                  <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="shrink-0">
                      <div className="h-8 w-8 rounded-full bg-linear-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                        <div className="h-5 w-5 flex items-center justify-center">
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                    <div className="min-w-25">
                      <div className="h-5 flex items-center">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          {stat.label}
                        </p>
                      </div>
                      <div className="h-4 flex items-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                          {stat.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes marquee-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }

        .animate-marquee:hover,
        .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}
