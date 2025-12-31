'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from "@/components/general/theme-toggle";


const DoctorHeader = ({ user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Get page title from pathname 
  const getPageTitle = () => {
    const path = pathname.split('/').pop()
    switch(path) {
      case 'appointments':
        return 'Appointments'
      case 'patients':
        return 'Patients'
      case 'earnings':
        return 'Earnings'
      case 'messages':
        return 'Messages'
      case 'profile':
        return 'Profile'
      case 'analytics':
        return 'Analytics'
      case 'settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and mobile menu */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold ">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-uted-foreground hidden sm:block">
                Welcome back, Dr. {user.name.split(' ')[0]}
              </p>
            </div>
          </div>

          {/* Right side - Search, notifications, settings, user */}
          <div className="flex items-center space-x-3">
            {/* Search - hidden on mobile */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search patients, appointments..."
                className="pl-10 w-48 lg:w-64"
              />
            </div>

            <ThemeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button 
              variant="ghost" 
              size="icon"
              asChild
            >
              <Link href="/doctor/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>

            {/* Clerk UserButton */}
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8",
                  userButtonTrigger: "focus:shadow-none"
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/doctor"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/doctor/appointments"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Appointments
            </Link>
            <Link
              href="/doctor/patients"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Patients
            </Link>
            <Link
              href="/doctor/earnings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Earnings
            </Link>
            <Link
              href="/doctor/messages"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Messages
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default DoctorHeader

