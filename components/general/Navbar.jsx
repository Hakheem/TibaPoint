"use client";

import React, { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/general/theme-toggle";
import { Button } from "../ui/button";
import { Menu, User, Calendar, Stethoscope, ShieldCheck, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs"

const Navbar = ({ dbUser }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false); // Track if we're on client
  
  // Safely extract user data
  const role = dbUser?.role || "UNASSIGNED";
  const credits = dbUser?.credits || 0;
  const consultations = Math.floor(credits / 2);

  useEffect(() => {
    setIsClient(true); // Set to true when component mounts on client
    
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    // Only run on client
    onScroll(); // Initial check
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getRoleConfig = () => {
    switch (role) {
      case "PATIENT":
        return {
          href: "/appointments",
          text: "My Appointments",
          icon: <Calendar className="h-4 w-4" />,
          variant: "secondary"
        };
      case "DOCTOR":
        return {
          href: "/dashboard",
          text: "Dashboard",
          icon: <Stethoscope className="h-4 w-4" />,
          variant: "secondary"
        };
      case "ADMIN":
        return {
          href: "/admin",
          text: "Admin",
          icon: <ShieldCheck className="h-4 w-4" />,
          variant: "secondary"
        };
      default:
        return {
          href: "/onboarding",
          text: "Complete Profile",
          icon: <User className="h-4 w-4" />,
          variant: "default"
        };
    }
  };

  const roleConfig = getRoleConfig();

  // Only apply scroll-based styles on client to avoid hydration mismatch
  const headerClass = !isClient 
    ? "fixed inset-x-0 top-0 z-50 bg-transparent" 
    : `fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? "bg-white/70 dark:bg-gray-900/70 backdrop-blur shadow"
          : "bg-transparent"
      }`;

  return (
    <header className={headerClass}>
      <nav className="container padded mx-auto flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image 
              src="/logo.png" 
              alt="TibaPoint" 
              fill 
              className="object-contain rounded-md" 
              sizes="32px"
            />
          </div>
          <span className="font-semibold text-lg">TibaPoint</span>
        </Link>
 
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          <SignedOut>
            <Link href="/pricing">
              <Button variant="secondary">Pricing</Button>
            </Link>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {/* Show credits for PATIENTS only */}
            {role === "PATIENT" && (
              <Link href="/credits">
                <Button variant="outline" className="gap-2 border-primary/20">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-semibold">{consultations}</span>
                  <span className="text-xs text-muted-foreground">
                    consultation{consultations !== 1 ? 's' : ''}
                  </span>
                </Button>
              </Link>
            )}

            {/* Role-specific button */} 
            <Link href={roleConfig.href}>
              <Button 
                variant={roleConfig.variant}
                className={`gap-2 ${
                  roleConfig.variant === 'default' 
                    ? 'bg-gradient-primary' 
                    : ''
                }`}
              >
                {roleConfig.icon}
                {roleConfig.text}
              </Button>
            </Link>
            
            <UserButton />
          </SignedIn>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />

          <SignedOut>
            <SignInButton>
              <Button size="icon" variant="ghost">
                <User className="h-5 w-5" />
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {/* Mobile credits display */}
            {role === "PATIENT" && (
              <Link href="/credits" className="mr-2">
                <Button variant="ghost" size="sm" className="gap-1 px-2">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span className="font-medium">{consultations}</span>
                </Button>
              </Link>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="relative h-8 w-8">
                      <Image 
                        src="/logo.png" 
                        alt="TibaPoint" 
                        fill 
                        className="object-contain" 
                        sizes="32px"
                      />
                    </div>
                    TibaPoint
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-4">
                  <Link href="/" className="hover:text-primary transition-colors py-2">
                    Home
                  </Link>
                  <Link href="/pricing" className="hover:text-primary transition-colors py-2">
                    Pricing
                  </Link>

                  {/* Mobile credits link */}
                  {role === "PATIENT" && (
                    <Link href="/credits" className="flex items-center gap-2 hover:text-primary transition-colors py-2">
                      <CreditCard className="h-4 w-4" />
                      <span>{consultations} consultations available</span>
                    </Link>
                  )}

                  <Link 
                    href={roleConfig.href} 
                    className="flex items-center gap-2 hover:text-primary transition-colors py-2"
                  >
                    {roleConfig.icon}
                    {roleConfig.text}
                  </Link>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Account</span>
                      <UserButton />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </SignedIn>
        </div>
      </nav>
    </header> 
  );
};

export default Navbar;

