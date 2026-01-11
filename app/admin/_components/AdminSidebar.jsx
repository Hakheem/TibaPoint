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
  HelpCircle,
  Eye,
  CheckCircle,
  MessageSquare
} from 'lucide-react'
import { NotificationBadge } from '@/components/notifications/NotificationBadge'

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
      name: 'Earnings',
      href: '/admin/earnings',
      icon: DollarSign,
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
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
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
    if (navigation.some(item => 
      item.subItems?.some(sub => sub.href === pathname)
    )) {
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
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
        >
          {isOpen ? (
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col h-screen
      `}>
        {/* Logo and Admin Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Administrator</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Platform Admin</span>
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
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800' 
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
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="space-y-3">
            <NotificationBadge />

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

