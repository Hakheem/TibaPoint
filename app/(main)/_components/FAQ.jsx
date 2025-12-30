'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Send, X } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQSection() {
  const [showAskAway, setShowAskAway] = useState(false)
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!question.trim()) return

    setIsSubmitting(true)
    
    // TODO: Wire this with your backend
    // await submitQuestion(question)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setQuestion('')
      setShowAskAway(false)
      // Show success message
      alert('Question submitted! We\'ll get back to you soon.')
    }, 1000)
  }

  const faqs = [ 
    {
      question: "How does the consultation credit system work?",
      answer: "Purchase consultations through our platform using M-Pesa, card, paypal or bank transfer. Each package gives you a set number of consultations. Use them anytime to book appointments with any verified doctor on our platform. All consultations are valid for 1 full year from purchase date."
    },
    {
      question: "Are the doctors verified?",
      answer: "Yes. Every doctor on TibaPoint is thoroughly verified. We check medical licenses, credentials, and professional history. Only qualified, licensed healthcare providers can join our platform. You can view each doctor's verification badge and credentials on their profile."
    },
    {
      question: "Can I get a refund if I don't use my consultations?",
      answer: "Absolutely. We offer a 100% refund guarantee for unused consultations within 30 days of purchase. After 30 days, you can still use your consultations anytime within the 1-year validity period. This gives you peace of mind when purchasing packages."
    },
    {
      question: "What if I need to cancel an appointment?",
      answer: "You can cancel appointments up to 24 hours before the scheduled time for a full refund (consultation returned to your account). Cancellations made less than 24 hours before will receive a 50% refund to compensate the doctor for their reserved time."
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
      question: "Can I share consultations with family members?",
      answer: "Yes. The Family and Wellness packages allow consultation sharing. Add family members to your account, and they can use consultations from your balance to book their own appointments. Each family member maintains their own private medical records."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept M-Pesa, Visa, Mastercard, Paypal and bank transfers. All payments are processed securely through trusted payment gateways. Your payment information is encrypted and never stored on our servers."
    },
    {
      question: "How quickly can I book an appointment?",
      answer: "Many doctors offer same-day appointments! Once you purchase a package, you can browse available doctors and book instantly. Most appointments can be scheduled within 24-48 hours, depending on the doctor's availability and your preferred time slot."
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
      question: "When do my consultations expire?",
      answer: "All consultations are valid for 1 full year (365 days) from the date of purchase. You'll receive email reminders at 90 days, 30 days, and 7 days before expiry. New users receive 1 free consultation valid for 90 days to try our platform."
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
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently {' '}
            <span className="text-gradient-primary">Asked Questions</span>
          </h2>
          <p className="text-base  text-muted-foreground">
            Everything you need to know about TibaPoint
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-5xl mx-auto ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column */}
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.slice(0, 6).map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border rounded-lg px-6 bg-card hover:border-primary/30 dark:hover:border-teal-500/30 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4 cursor-pointer ">
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
                  <AccordionTrigger className="text-left hover:no-underline py-4 cursor-pointer ">
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
        <div className="relative text-center mt-12 md:mt-16 p-8 rounded-2xl bg-linear-to-b from-blue-100 via-blue-50 to-transparent dark:from-primary/30 dark:via-primary/10 dark:to-transparent border border-primary/10 dark:border-teal-500/20 max-w-2xl mx-auto">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you 24/7
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@tibapoint.com">
              <Button className="bg-gradient-primary hover:opacity-90 gap-2">
                <MessageCircle className="h-4 w-4" />
                Email Support
              </Button>
            </a>
            
            <a href="https://wa.me/254700000000?text=Hi%20TibaPoint,%20I%20have%20a%20question" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-primary dark:border-teal-500 text-primary dark:text-teal-400 hover:bg-primary/5 dark:hover:bg-teal-500/10 gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </Button>
            </a>
            
            <Button 
              variant="outline" 
              className="border-primary dark:border-teal-500 text-primary dark:text-teal-400 hover:bg-primary/5 dark:hover:bg-teal-500/10 gap-2"
              onClick={() => setShowAskAway(!showAskAway)}
            >
              <Send className="h-4 w-4" />
              Ask Away
            </Button>
          </div>

          {/* Ask Away Form */}
          {showAskAway && (
            <div className="absolute top-full left-0 right-0 mt-4 p-6 rounded-xl bg-card border border-border shadow-xl z-20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">Ask Your Question</h4>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAskAway(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <Textarea 
                  placeholder="Type your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-32 resize-none"
                  disabled={isSubmitting}
                />
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => setShowAskAway(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-primary hover:opacity-90 gap-2"
                    disabled={isSubmitting || !question.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Question
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                We typically respond within 24 hours
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

