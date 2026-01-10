"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowForm(false);
    alert("Thank you for your message! We'll get back to you within 24 hours.");
  };

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email",
      value: "support@tibapoint.com",
      description: "For general inquiries and support",
      action: "mailto:support@tibapoint.com",
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Phone",
      value: "+254 700 123 456",
      description: "Monday - Friday, 8AM - 5PM",
      action: "tel:+254700123456",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "WhatsApp",
      value: "+254 700 123 456",
      description: "Quick chat support",
      action: "https://wa.me/254700123456",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Address",
      value: "TibaPoint Plaza, Nairobi",
      description: "Westlands, Nairobi, Kenya",
      action: "https://maps.google.com/?q=TibaPoint+Plaza+Nairobi",
    },
  ];

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer:
        "Simply search for a doctor by specialty, select your preferred time slot, and confirm your booking using tokens or direct payment.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept M-Pesa, credit/debit cards, bank transfers, and our unique token system for flexible healthcare access.",
    },
    {
      question: "Are video consultations secure?",
      answer:
        "Yes, all our video consultations are end-to-end encrypted and HIPAA compliant to ensure your privacy and security.",
    },
    {
      question: "How do I access my medical records?",
      answer:
        "All your medical records are securely stored in your account dashboard. You can access and download them anytime.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <Badge className="mb-4 px-4 py-1 bg-primary/10 text-primary dark:bg-teal-500/20 dark:text-teal-300">
          Get In Touch
        </Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          We're Here to <span className="text-gradient-primary">Help You</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Have questions about our services? Need assistance with your account?
          Reach out to our team—we're always ready to support your healthcare
          journey.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column - Contact Info & FAQ */}
        <div className="space-y-8">
          {/* Contact Information Cards */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Choose your preferred way to reach us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.action}
                  target={item.action.startsWith("http") ? "_blank" : undefined}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-all group"
                  whileHover={{ x: 4 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary dark:bg-teal-500/20 dark:text-teal-300 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-foreground">{item.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </motion.a>
              ))}
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-semibold text-foreground">
                    {faq.question}
                  </h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  {index < faqs.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Toggleable Contact Form */}
        <div className="space-y-8">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Prefer to write? We'll respond within 24 hours
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowForm(!showForm)}
                  className="h-10 w-10"
                >
                  {showForm ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            required
                            className="border-border/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            required
                            className="border-border/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="How can we help?"
                          required
                          className="border-border/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us about your inquiry..."
                          rows={4}
                          required
                          className="border-border/50 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Operating Hours */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Monday - Friday</span>
                  <span className="text-foreground">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Saturday</span>
                  <span className="text-foreground">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Sunday & Holidays</span>
                  <span className="text-foreground">
                    Emergency Support Only
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 dark:bg-teal-500/10 dark:border-teal-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary dark:bg-teal-500/20 dark:text-teal-300">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      24/7 Emergency Support
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      For urgent medical issues, call our emergency line at{" "}
                      <a
                        href="tel:+254711000000"
                        className="text-primary dark:text-teal-300 font-semibold hover:underline"
                      >
                        +254 711 000 000
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/help-center">Help Center</a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/privacy">Privacy Policy</a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/terms">Terms of Service</a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/doctors">Find a Doctor</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-teal-500/5 dark:from-teal-500/10 dark:to-teal-500/5 border border-border/50">
          <div className="text-left">
            <h3 className="text-xl font-bold text-foreground">
              Need Immediate Assistance?
            </h3>
            <p className="text-muted-foreground mt-1">
              Our support team is always ready to help with any questions or
              concerns.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <a href="tel:+254700123456">Call Now</a>
            </Button>
            <Button
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => setShowForm(true)}
            >
              Send Message
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
