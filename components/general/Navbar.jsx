// components/general/Navbar.jsx
"use client";

import React, { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/general/theme-toggle";
import { Button } from "../ui/button";
import { Menu, User, Calendar, Stethoscope, ShieldCheck } from "lucide-react";
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
} from "@clerk/nextjs";

const Navbar = ({ dbUser }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Get role from database user (not Clerk metadata)
  const role = dbUser?.role || "UNASSIGNED";

  const getRoleConfig = () => {
    switch (role) {
      case "PATIENT":
        return {
          href: "/doctors",
          text: "Find Doctors",
          icon: <Calendar className="h-4 w-4" />,
          variant: "secondary"
        };
      case "DOCTOR":
        return {
          href: "/doctor",
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
          variant: "default" // Gradient to encourage completion
        };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? "bg-white/70 dark:bg-gray-900/70 backdrop-blur shadow"
          : "bg-transparent"
      }`}
    >
      <nav className="container padded mx-auto flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image src="/logo.png" alt="TibaPoint" fill className="object-contain rounded-md" />
          </div>
          <span className="font-semibold text-lg">TibaPoint</span>
        </Link>
 
        {/* Desktop */}
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
            <Link href={roleConfig.href}>
              <Button 
                variant={roleConfig.variant}
                className={`gap-2 ${
                  roleConfig.variant === 'default' 
                    ? 'bg-gradient-primary hover:opacity-90' 
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

        {/* Mobile */}
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
                      <Image src="/logo.png" alt="TibaPoint" fill className="object-contain" />
                    </div>
                    TibaPoint
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-4">
                  <Link href="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                  <Link href="/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>

                  <Link 
                    href={roleConfig.href} 
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {roleConfig.icon}
                    {roleConfig.text}
                  </Link>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account</span>
                      <UserButton />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    © {new Date().getFullYear()} TibaPoint. All rights reserved.
                  </p>
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
