'use client'

import { Search, Wallet, Video, FileText, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function Features() {
  const features = [
    {
      badge: "FIND THE RIGHT DOCTOR",
      title: "Discover Doctors That Match Your Needs",
      description: "Search by specialty, location, language, gender, and availability. Filter by insurance accepted, consultation fees, and patient ratings. Find your perfect healthcare match in seconds.",
      benefits: [
        "50+ medical specialties",
        "Real-time availability",
        "Verified credentials & licenses",
        "Patient reviews & ratings"
      ],
      icon: <Search className="h-6 w-6" />,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/30",
      image: "/feature-search.png", // Replace with your actual image
      imageAlt: "Doctor search interface with filters",
      reversed: false
    },
    {
      badge: "FLEXIBLE PAYMENTS",
      title: "Buy Once, Book Anytime",
      description: "Purchase appointment tokens at your convenience and use them whenever you need care. No subscriptions, no hidden fees—just transparent, flexible healthcare access.",
      benefits: [
        "Never expires token packages",
        "M-Pesa, card & bank payments",
        "Instant purchase confirmation",
        "Refund protection guarantee"
      ],
      icon: <Wallet className="h-6 w-6" />,
      iconColor: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-50 dark:bg-teal-950/30",
      image: "/feature-tokens.png", // Replace with your actual image
      imageAlt: "Token wallet dashboard",
      reversed: true
    },
    {
      badge: "CARE FROM ANYWHERE",
      title: "Consult From the Comfort of Home",
      description: "Can't make it to the clinic? No problem. Book secure video consultations with licensed doctors. Get prescriptions, medical advice, and follow-ups—all online.",
      benefits: [
        "HD video & audio quality",
        "Encrypted consultations",
        "Digital prescriptions",
        "Record consultations (with permission)"
      ],
      icon: <Video className="h-6 w-6" />,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/30",
      image: "/feature-video.png", // Replace with your actual image
      imageAlt: "Video consultation interface",
      reversed: false
    },
    {
      badge: "YOUR DATA, SECURED",
      title: "All Your Medical Records in One Place",
      description: "Access your complete medical history, prescriptions, lab results, and consultation notes anytime. Share records securely with any doctor on the platform.",
      benefits: [
        "End-to-end encryption",
        "GDPR compliant storage",
        "Easy sharing with doctors",
        "Download anytime as PDF"
      ],
      icon: <FileText className="h-6 w-6" />,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
      image: "/feature-records.png", // Replace with your actual image
      imageAlt: "Medical records dashboard",
      reversed: true
    }
  ]

  return (
    <section className="relative py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-100/20 dark:bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container padded mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs md:text-sm font-semibold tracking-wider uppercase text-primary dark:text-teal-400 bg-primary/10 dark:bg-teal-500/20 px-4 py-2 rounded-full">
              Features
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need for{' '}
            <span className="text-linear-primary">Quality Healthcare</span>
          </h2>
        </div>

        {/* Features List */}
        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                feature.reversed ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className={`space-y-6 ${feature.reversed ? 'lg:order-2' : 'lg:order-1'}`}>
                {/* Badge */}
                <div className="inline-block">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                    {feature.badge}
                  </span>
                </div>

                {/* Icon */}
                <div className={`${feature.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center`}>
                  <div className={feature.iconColor}>
                    {feature.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Benefits List */}
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <div className={`relative ${feature.reversed ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-muted shadow-2xl border border-border">
                  {/* Placeholder linear if no image */}
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-teal/10 to-transparent" />
                  
                  {/* Replace with actual Image component when you have images */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`${feature.iconBg} p-8 rounded-2xl`}>
                      <div className={`${feature.iconColor} scale-[2]`}>
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Uncomment when you have images:
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  */}
                </div>

                {/* Decorative glow */}
                <div className={`absolute -inset-4 bg-linear-to-br ${feature.reversed ? 'from-teal-500/20 to-blue-500/20' : 'from-blue-500/20 to-teal-500/20'} rounded-3xl blur-3xl -z-10 opacity-50`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

