'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, Search, Settings, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/general/theme-toggle'
import { NotificationBell } from "@/components/notifications/NotificationBell"

const AdminHeader = ({ user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split('/').pop()
    switch(path) {
      case 'doctors':
        return 'Doctor Management'
      case 'patients':
        return 'Patient Management'
      case 'appointments':
        return 'Appointment Management'
      case 'refunds':
        return 'Refund Management'
      case 'penalties':
        return 'Penalty Management'
      case 'packages':
        return 'Package Management'
      case 'earnings':
        return 'Platform Earnings'
      case 'analytics':
        return 'Analytics & Reports'
      case 'notifications':
        return 'Notifications Management'
      case 'system':
        return 'System Settings'
      case 'support':
        return 'Support Tickets'
      default:
        return 'Admin Dashboard'
    }
  }

  const getPageDescription = () => {
    const path = pathname.split('/').pop()
    switch(path) {
      case 'doctors':
        return 'Manage all doctors on the platform'
      case 'patients':
        return 'View and manage all patients'
      case 'appointments':
        return 'Monitor all consultations and appointments'
      case 'earnings':
        return 'Track platform revenue and payouts'
      case 'analytics':
        return 'View platform performance insights'
      case 'notifications':
        return 'Send and manage platform notifications'
      case 'system':
        return 'Configure system settings and preferences'
      case 'support':
        return 'Handle user support requests'
      default:
        return 'Platform administration and management'
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search users, appointments..."
                className="pl-10 w-48 lg:w-64 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
            
            <ThemeToggle />

            {/* Notifications */}
            <NotificationBell />

            {/* Quick Stats */}
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden lg:flex"
              asChild
            >
              <Link href="/admin/analytics">
                <Shield className="h-5 w-5" />
              </Link>
            </Button>

            {/* Settings */}
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden sm:flex"
              asChild
            >
              <Link href="/admin/system/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>

            {/* Clerk UserButton */}
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

            {/* Mobile user menu */}
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
              href="/admin"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/doctors"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Doctors
            </Link>
            <Link
              href="/admin/patients"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Patients
            </Link>
            <Link
              href="/admin/appointments"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Appointments
            </Link>
            <Link
              href="/admin/earnings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Earnings
            </Link>
            <Link
              href="/admin/notifications"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Notifications
            </Link>
            <Link
              href="/admin/analytics"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Analytics
            </Link>
            <Link
              href="/admin/system"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              System
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default AdminHeader

