// app/admin/_components/RecentActivity.jsx
'use client'

import { useState, useEffect } from 'react'
import { Clock, UserCheck, Calendar, CreditCard, AlertCircle, UserX, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const RecentActivity = () => {
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'DOCTOR_VERIFIED',
      title: 'Doctor Verified',
      description: 'Dr. Sarah Johnson (Cardiology) has been verified',
      timestamp: '10 minutes ago',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 2,
      type: 'APPOINTMENT_CANCELLED',
      title: 'Appointment Cancelled',
      description: 'John Doe cancelled appointment with Dr. Michael Chen',
      timestamp: '25 minutes ago',
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 3,
      type: 'REFUND_PROCESSED',
      title: 'Refund Processed',
      description: 'KSh 500 refunded to Jane Smith',
      timestamp: '1 hour ago',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 4,
      type: 'PENALTY_ISSUED',
      title: 'Penalty Issued',
      description: 'No-show penalty issued to Dr. Robert Wilson',
      timestamp: '2 hours ago',
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 5,
      type: 'DOCTOR_REJECTED',
      title: 'Doctor Rejected',
      description: 'Dr. James Miller application rejected',
      timestamp: '3 hours ago',
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 6,
      type: 'APPOINTMENT_COMPLETED',
      title: 'Appointment Completed',
      description: 'Consultation completed with Dr. Emily Davis',
      timestamp: '4 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ])

  const getActivityIcon = (type) => {
    switch(type) {
      case 'DOCTOR_VERIFIED':
        return UserCheck
      case 'DOCTOR_REJECTED':
        return UserX
      case 'APPOINTMENT_CANCELLED':
        return XCircle
      case 'APPOINTMENT_COMPLETED':
        return CheckCircle
      case 'REFUND_PROCESSED':
        return CreditCard
      case 'PENALTY_ISSUED':
        return AlertCircle
      default:
        return Clock
    }
  }

  const getActivityColor = (type) => {
    switch(type) {
      case 'DOCTOR_VERIFIED':
      case 'APPOINTMENT_COMPLETED':
        return 'text-green-600'
      case 'DOCTOR_REJECTED':
      case 'APPOINTMENT_CANCELLED':
        return 'text-red-600'
      case 'REFUND_PROCESSED':
        return 'text-blue-600'
      case 'PENALTY_ISSUED':
        return 'text-amber-600'
      default:
        return 'text-gray-600'
    }
  }

  const getActivityBgColor = (type) => {
    switch(type) {
      case 'DOCTOR_VERIFIED':
      case 'APPOINTMENT_COMPLETED':
        return 'bg-green-50'
      case 'DOCTOR_REJECTED':
      case 'APPOINTMENT_CANCELLED':
        return 'bg-red-50'
      case 'REFUND_PROCESSED':
        return 'bg-blue-50'
      case 'PENALTY_ISSUED':
        return 'bg-amber-50'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest actions and events on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const color = getActivityColor(activity.type)
            const bgColor = getActivityBgColor(activity.type)
            
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className={`p-2 rounded-lg ${bgColor} flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {activity.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {activities.length} activities
            </div>
            <Button variant="outline" size="sm">
              View All Activity
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentActivity

