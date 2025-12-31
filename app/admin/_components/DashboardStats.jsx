'use client'

import { Users, User, Calendar, DollarSign, TrendingUp, Package, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totals.patients.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      description: 'Active patients',
    },
    {
      title: 'Total Doctors',
      value: stats.totals.doctors.toLocaleString(),
      icon: User,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      description: `${stats.pending.doctors} pending`,
    },
    {
      title: 'Total Appointments',
      value: stats.totals.appointments.toLocaleString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%',
      description: `${stats.current.activeAppointments} active`,
    },
    {
      title: 'Total Revenue',
      value: `KSh ${stats.totals.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      change: '+22%',
      description: 'Lifetime earnings',
    },
    {
      title: 'Monthly Revenue',
      value: `KSh ${stats.revenue.monthly.total.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+18%',
      description: 'This month',
    },
    {
      title: 'Pending Actions',
      value: (stats.pending.doctors + stats.pending.refunds).toString(),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Require attention',
      subItems: [
        { label: 'Doctors', count: stats.pending.doctors },
        { label: 'Refunds', count: stats.pending.refunds },
      ],
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                <div className="flex items-center mt-1">
                  {stat.change && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded mr-2">
                      {stat.change}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                
                {stat.subItems && (
                  <div className="flex space-x-4 mt-3">
                    {stat.subItems.map((item, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="font-medium">{item.count}</span>
                        <span className="text-gray-500 ml-1">{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            
            {/* Progress bar for some stats */}
            {stat.title === 'Monthly Revenue' && stats.revenue.yearly.total > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Monthly Progress</span>
                  <span>{((stats.revenue.monthly.total / stats.revenue.yearly.total) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min((stats.revenue.monthly.total / stats.revenue.yearly.total) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default DashboardStats

