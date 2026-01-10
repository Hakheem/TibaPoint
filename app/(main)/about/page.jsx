import React from "react";
import Features from "../_components/Features";
import { Badge } from "@/components/ui/badge";

const page = () => {
  return (
    <div className="container padded mx-auto pt-24 ">
      {/* About Us Header */}
      <div className="max-w-4xl mx-auto text-center mt-8 mb-16">
        <h1 className="text-4xl  font-bold mb-6">
          <span className="">Redefining Healthcare</span> Access
        </h1>

        {/* About Us Paragraph */}
        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            <strong>TibaPoint</strong> is revolutionizing how patients access
            quality healthcare by connecting them directly with verified doctors
            through a seamless digital platform. We eliminate the traditional
            barriers of healthcare—long wait times, geographical limitations,
            and payment complexities by offering instant access to medical
            professionals across 40+ specialties, flexible payment options with
            tokens, and secure virtual consultations from anywhere. What sets us
            apart is our commitment to transparency: we verify every doctor's
            credentials, display real availability and pricing upfront, and
            protect your medical data with end-to-end encryption. Whether you
            need a routine check-up, specialist consultation, or second opinion,
            TibaPoint delivers healthcare that's convenient, affordable, and
            trustworthy—putting you in control of your health journey.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Badge className="px-4 py-2 bg-primary/10 rounded-full text-sm font-semibold inline-flex items-center gap-2 text-primary dark:bg-teal-500/20 dark:text-teal-300">
              💡 50+ Medical Specialties
            </Badge>
            <Badge className="px-4 py-2 bg-teal-500/10 rounded-full text-sm font-semibold text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">
              🔒 End-to-End Encrypted
            </Badge>
            <Badge className="px-4 py-2 bg-purple-500/10 rounded-full text-sm font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
              ⚡ Instant Appointments
            </Badge>
            <Badge className="px-4 py-2 bg-emerald-500/10 rounded-full text-sm font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              💰 Transparent Pricing
            </Badge>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Features />
    </div>
  );
};

export default page;
