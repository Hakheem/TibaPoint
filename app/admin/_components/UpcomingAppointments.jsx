// app/admin/_components/UpcomingAppointments.jsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, User, Stethoscope, Clock, Video, MapPin, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const UpcomingAppointments = ({ appointments = [] }) => {
  const [loading, setLoading] = useState({})

  const handleAction = async (appointmentId, action) => {
    setLoading(prev => ({ ...prev, [appointmentId]: action }))
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // TODO: Implement actual API calls
    console.log(`${action} appointment ${appointmentId}`)
    
    setLoading(prev => ({ ...prev, [appointmentId]: null }))
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let dayLabel = ''
    if (date.toDateString() === today.toDateString()) {
      dayLabel = 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dayLabel = 'Tomorrow'
    } else {
      dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })
    }

    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      dayLabel,
      isToday: dayLabel === 'Today',
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'SCHEDULED':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'IN_PROGRESS':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Appointments
          </CardTitle>
          <CardDescription>
            Appointments scheduled for the next few days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No upcoming appointments.</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for new bookings.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Upcoming Appointments
          <span className="ml-2 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">
            {appointments.length}
          </span>
        </CardTitle>
        <CardDescription>
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const dateTime = formatDateTime(appointment.startTime)
            const statusColor = getStatusColor(appointment.status)

            return (
              <div
                key={appointment.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                          {appointment.status}
                        </span>
                        {dateTime.isToday && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            {dateTime.dayLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {dateTime.time}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Patient Info */}
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {appointment.patient?.name || 'Unknown Patient'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            Patient
                          </p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {dateTime.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {appointment.doctor?.name || 'Unknown Doctor'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {appointment.doctor?.speciality || 'Doctor'}
                          </p>
                          <div className="flex items-center mt-1">
                            {appointment.videoSessionId ? (
                              <>
                                <Video className="h-3 w-3 text-blue-400 mr-1" />
                                <span className="text-xs text-gray-500">Video Consultation</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">In-person</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/appointments/${appointment.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction(appointment.id, 'cancel')}
                        disabled={loading[appointment.id] === 'cancel'}
                      >
                        {loading[appointment.id] === 'cancel' ? 'Cancelling...' : 'Cancel Appointment'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction(appointment.id, 'reschedule')}
                        disabled={loading[appointment.id] === 'reschedule'}
                      >
                        {loading[appointment.id] === 'reschedule' ? 'Rescheduling...' : 'Reschedule'}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/patients/${appointment.patientId}`}>
                          View Patient
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/doctors/${appointment.doctorId}`}>
                          View Doctor
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Duration: <span className="font-medium">60 mins</span>
                  </div>
                  <div className="text-gray-600">
                    Credits: <span className="font-medium">{appointment.creditsCharged || 2}</span>
                  </div>
                  <div className="text-gray-600">
                    Earnings: <span className="font-medium">KSh {(appointment.platformEarnings || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          })}

          {appointments.length > 3 && (
            <div className="text-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/admin/appointments">
                  View All Appointments
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default UpcomingAppointments

