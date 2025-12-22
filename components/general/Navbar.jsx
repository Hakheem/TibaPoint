"use client";

import React, { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/general/theme-toggle";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-sm"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
      }`}
    >
      <nav className="container mx-auto  py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10">
              <Image
                src="/logo.PNG"
                alt="TibaPoint Logo"
                fill
                className="object-contain rounded-md "
                priority
              />
            </div>
            <span className="ml-1 text-lg font-semibold ">TibaPoint</span>
          </Link>

          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <Link href="/login">
              <Button className="">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-10 w-10" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-75 sm:w-85 px-4">
                <SheetHeader>
                  <SheetTitle className="flex items-center">
                    <div className="relative h-8 w-8 mr-2">
                      <Image
                        src="/logo.png"
                        alt="TibaPoint Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="">TibaPoint</span>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col space-y-4 mt-8">
                  <Link
                    href="/"
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="font-medium">Home</span>
                  </Link>

                  <div className="pt-4">
                    <Link href="/login">
                      <Button className="w-full bg-linear-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    © 2026 MediPass. All rights reserved.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
