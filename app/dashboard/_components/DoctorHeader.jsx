'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from "@/components/general/theme-toggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";

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
      case 'notifications':
        return 'Notifications'
      case 'availability':
        return 'Availability'
      default:
        return 'Dashboard'
    }
  }

  const getPageDescription = () => {
    const path = pathname.split('/').pop()
    switch(path) {
      case 'appointments':
        return 'Manage your appointments and consultations'
      case 'patients':
        return 'View and manage your patients'
      case 'earnings':
        return 'Track your earnings and financial performance'
      case 'messages':
        return 'Communicate with patients and colleagues'
      case 'profile':
        return 'Manage your professional profile'
      case 'analytics':
        return 'View performance analytics and insights'
      case 'settings':
        return 'Configure your account settings'
      case 'notifications':
        return 'Stay updated with important alerts'
      case 'availability':
        return 'Set your consultation hours'
      default:
        return 'Welcome back to your dashboard'
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and mobile menu */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                {getPageDescription()}
              </p>
            </div>
          </div>

          {/* Right side - Search, notifications, settings, user */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search - hidden on mobile */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search patients, appointments..."
                className="pl-10 w-48 lg:w-64 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <NotificationBell />

            {/* Settings */}
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden sm:flex"
              asChild
            >
              <Link href="/dashboard/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>

            {/* User Profile - Hidden on small mobile */}
            <div className="hidden sm:block">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8",
                    userButtonTrigger: "focus:shadow-none hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                }}
              />
            </div>

            {/* Mobile user menu button */}
            <div className="sm:hidden">
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
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-white dark:bg-gray-900">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/appointments"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Appointments
            </Link>
            <Link
              href="/dashboard/patients"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Patients
            </Link>
            <Link
              href="/dashboard/earnings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Earnings
            </Link>
            <Link
              href="/dashboard/availability"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Availability
            </Link>
            <Link
              href="/dashboard/notifications"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Notifications
            </Link>
            <Link
              href="/dashboard/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default DoctorHeader

