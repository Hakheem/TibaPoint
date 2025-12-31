'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  User,
  Calendar,
  CreditCard,
  AlertCircle,
  Package,
  BarChart3,
  Settings,
  Shield,
  DollarSign,
  Bell,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

const AdminSidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState({})
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
    },
    {
      name: 'Doctor Management',
      href: '/admin/doctors',
      icon: User,
      subItems: [
        { name: 'All Doctors', href: '/admin/doctors' },
        { name: 'Pending Verification', href: '/admin/doctors/pending' },
        { name: 'Suspended/Banned', href: '/admin/doctors/suspended' },
      ],
    },
    {
      name: 'Patient Management',
      href: '/admin/patients',
      icon: Users,
    },
    {
      name: 'Appointments',
      href: '/admin/appointments',
      icon: Calendar,
      subItems: [
        { name: 'All Appointments', href: '/admin/appointments' },
        { name: 'Upcoming', href: '/admin/appointments/upcoming' },
        { name: 'Completed', href: '/admin/appointments/completed' },
      ],
    },
    {
      name: 'Refunds',
      href: '/admin/refunds',
      icon: CreditCard,
    },
    {
      name: 'Penalties',
      href: '/admin/penalties',
      icon: AlertCircle,
    },
    {
      name: 'Credit Packages',
      href: '/admin/packages',
      icon: Package,
    },
    {
      name: 'Transactions',
      href: '/admin/transactions',
      icon: DollarSign,
    },
    {
      name: 'Analytics & Reports',
      href: '/admin/analytics',
      icon: BarChart3,
      subItems: [
        { name: 'Overview', href: '/admin/analytics' },
        { name: 'Revenue', href: '/admin/analytics/revenue' },
        { name: 'User Growth', href: '/admin/analytics/growth' },
        { name: 'Appointment Stats', href: '/admin/analytics/appointments' },
      ],
    },
    {
      name: 'System',
      href: '/admin/system',
      icon: Settings,
      subItems: [
        { name: 'Configuration', href: '/admin/system/config' },
        { name: 'Logs', href: '/admin/system/logs' },
        { name: 'Notifications', href: '/admin/system/notifications' },
      ],
    },
  ]

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const isSubItemActive = (href) => {
    return pathname === href
  }

  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }))
  }

  const isExpanded = (itemName) => {
    // Auto-expand if subitem is active
    if (isActive(`/admin/${itemName.toLowerCase().replace(' ', '-')}`)) {
      return true
    }
    return expandedItems[itemName] || false
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white shadow-md border"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col h-screen
      `}>
        {/* Logo and Admin Info */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Administrator</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable area */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const expanded = isExpanded(item.name)
              
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center flex-1 space-x-3 px-3 py-2.5 rounded-lg transition-colors
                          ${active 
                            ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                          }
                        `}
                      >
                        <Icon size={20} />
                        <span className="flex-1 text-sm font-medium">{item.name}</span>
                        {item.subItems && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleExpanded(item.name)
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            {expanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </Link>
                    </div>

                    {/* Sub-items */}
                    {item.subItems && expanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className={`
                              block px-3 py-2 rounded text-sm transition-colors
                              ${isSubItemActive(subItem.href)
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                              }
                            `}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </nav>

        {/* Bottom Section - Fixed at bottom */}
        <div className="border-t p-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Pending Actions</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Check verification requests</p>
              </div>
              <span className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                3
              </span>
            </div>

          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default AdminSidebar

