'use client'

import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQSection() {
  const faqs = [
    {
      question: "How does the token system work?",
      answer: "Purchase appointment tokens through our platform using M-Pesa, card, or bank transfer. Each token equals one appointment booking. Use tokens anytime to book consultations with any doctor on our platform. Tokens never expire, giving you complete flexibility."
    },
    {
      question: "Are the doctors verified?",
      answer: "Yes! Every doctor on TibaPoint is thoroughly verified. We check medical licenses, credentials, and professional history. Only qualified, licensed healthcare providers can join our platform. You can view each doctor's verification badge and credentials on their profile."
    },
    {
      question: "Can I get a refund if I don't use my tokens?",
      answer: "Absolutely. We offer a 100% refund guarantee for unused tokens within 30 days of purchase. After 30 days, you can still use your tokens anytime as they never expire. This gives you peace of mind when purchasing token packages."
    },
    {
      question: "What if I need to cancel an appointment?",
      answer: "You can cancel appointments up to 24 hours before the scheduled time for a full token refund. Cancellations made less than 24 hours before will forfeit the token, which goes to the doctor as compensation for their reserved time."
    },
    {
      question: "Is video consultation as good as in-person?",
      answer: "Video consultations are ideal for follow-ups, prescription renewals, minor ailments, and medical advice. For conditions requiring physical examination or diagnostic tests, we recommend in-person visits. Your doctor will advise if an in-person visit is necessary."
    },
    {
      question: "How secure is my medical data?",
      answer: "Very secure. We use bank-level encryption (256-bit SSL) to protect your data. Your medical records are stored in GDPR-compliant servers with regular security audits. We never share your information without your explicit consent, and you have full control over your data."
    },
    {
      question: "Can I share tokens with family members?",
      answer: "Yes! The Family and Wellness packages allow token sharing. Add family members to your account, and they can use tokens from your balance to book their own appointments. Each family member maintains their own private medical records."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept M-Pesa, Visa, Mastercard, and bank transfers. All payments are processed securely through trusted payment gateways. Your payment information is encrypted and never stored on our servers."
    },
    {
      question: "How quickly can I book an appointment?",
      answer: "Many doctors offer same-day appointments! Once you purchase tokens, you can browse available doctors and book instantly. Most appointments can be scheduled within 24-48 hours, depending on the doctor's availability and your preferred time slot."
    },
    {
      question: "What happens during a video consultation?",
      answer: "Video consultations work just like in-person visits. At your scheduled time, join the call through our platform. The doctor will discuss your symptoms, review your medical history, and provide a diagnosis. They can prescribe medication, order tests, and schedule follow-ups—all online."
    },
    {
      question: "Can I choose my preferred doctor?",
      answer: "Absolutely! Browse our directory of 500+ verified doctors, filter by specialty, location, language, availability, and ratings. Read patient reviews and view doctor profiles before booking. You have complete freedom to choose the healthcare provider that fits your needs."
    },
    {
      question: "Do tokens expire?",
      answer: "No, tokens never expire! This is one of our key features. Purchase tokens today and use them months or even years later. You're never pressured to use them quickly, giving you true flexibility in managing your healthcare."
    }
  ]

  return (
    <section className="relative py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container padded mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-block mb-4">
            <Badge variant="outline" className="text-xs md:text-sm font-semibold tracking-wider uppercase border-primary/20 dark:border-teal-500/30">
              FAQ
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Frequently Asked{' '}
            <span className="text-gradient-primary">Questions</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Everything you need to know about TibaPoint
          </p>
        </div>

        {/* FAQ Accordion - Two Columns on Desktop */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column */}
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.slice(0, 6).map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border rounded-lg px-6 bg-card hover:border-primary/30 dark:hover:border-teal-500/30 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold text-sm md:text-base pr-4">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Right Column */}
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.slice(6, 12).map((faq, index) => (
                <AccordionItem 
                  key={index + 6} 
                  value={`item-${index + 6}`}
                  className="border border-border rounded-lg px-6 bg-card hover:border-primary/30 dark:hover:border-teal-500/30 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold text-sm md:text-base pr-4">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Still have questions CTA */}
        <div className="text-center mt-12 md:mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-teal/5 to-transparent dark:from-primary/10 dark:via-teal/10 border border-primary/10 dark:border-teal-500/20 max-w-2xl mx-auto">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@tibapoint.com">
              <button className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                Contact Support
              </button>
            </a>
            <a href="/help-center">
              <button className="px-6 py-3 border-2 border-primary dark:border-teal-500 text-primary dark:text-teal-400 rounded-lg font-semibold hover:bg-primary/5 dark:hover:bg-teal-500/10 transition-all duration-300">
                Visit Help Center
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

