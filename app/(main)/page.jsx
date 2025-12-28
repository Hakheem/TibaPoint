import React from 'react'
import HeroSection from "./_components/HeroSection";
import TrustBadgesSection from "./_components/TrustBadgesSection";
import HowItWorks from "./_components/HowItWorks";
import Testimonials from "./_components/Testimonials";
import ForDoctors from "./_components/ForDoctors";
import Pricing from "./_components/Pricing";
import FAQSection from "./_components/FAQ";
import CTASection from "./_components/CTA";
import ClerkPricing from "./_components/ClerkPricing";

const page = () => {
  return (
    <div>

<HeroSection />
<TrustBadgesSection />
<HowItWorks />
<ForDoctors />
<Pricing />
{/* <ClerkPricing /> */}
<CTASection />
<Testimonials />
<FAQSection />
    </div>
  )
}

export default page