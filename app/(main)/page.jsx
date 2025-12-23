import React from 'react'
import HeroSection from "./_components/HeroSection";
import TrustBadgesSection from "./_components/TrustBadgesSection";
import HowItWorks from "./_components/HowItWorks";
import Testimonials from "./_components/Testimonials";
import ForDoctors from "./_components/ForDoctors";
import Features from "./_components/Features";
import Pricing from "./_components/Pricing";
import FAQSection from "./_components/FAQ";
import CTASection from "./_components/CTA";

const page = () => {
  return (
    <div>

<HeroSection />
<TrustBadgesSection />
<HowItWorks />
<Pricing />
<FAQSection />
<Features />
<ForDoctors />
<Testimonials />
<CTASection />
    </div>
  )
}

export default page