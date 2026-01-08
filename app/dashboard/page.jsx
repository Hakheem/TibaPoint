// app/dashboard/page.jsx - Updated version with improvements
import { checkUser } from '@/lib/checkUser'
import { redirect } from 'next/navigation'
import { getDoctorStats, getDoctorAppointments } from '@/actions/doctors' 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  Clock,
  TrendingUp,
  Activity,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { AvailabilitySummary } from './_components/AvailabilitySummary'

const DoctorPage = async () => {
  const user = await checkUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (user.role !== 'DOCTOR') {
    redirect('/')
  }

  if (user.verificationStatus !== 'VERIFIED') {
    redirect('/dashboard/verification')
  }

  try {
    // Fetch all data in parallel for better performance
    const [statsResult, todayAppointmentsResult, upcomingAppointmentsResult] = await Promise.all([
      getDoctorStats(),
      getDoctorAppointments('today'),
      getDoctorAppointments('upcoming')
    ]);

    // Handle potential errors 
    const stats = statsResult.success ? statsResult.stats : { 
      totalAppointments: 0,
      completedAppointments: 0,
      upcomingAppointments: 0,
      totalEarnings: 0,
      rating: 0,
      totalReviews: 0,
      creditBalance: 0
    };
    
    const todayAppointments = todayAppointmentsResult.success ? todayAppointmentsResult.appointments : [];
    const upcomingAppointments = upcomingAppointmentsResult.success ? upcomingAppointmentsResult.appointments : [];

    // Filter today's appointments to only show today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filteredTodayAppointments = todayAppointments.filter(apt => {
      const appointmentDate = new Date(apt.startTime);
      return appointmentDate >= today && appointmentDate < tomorrow;
    });

    // Filter upcoming appointments (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const filteredUpcomingAppointments = upcomingAppointments.filter(apt => {
      const appointmentDate = new Date(apt.startTime);
      return appointmentDate >= tomorrow && appointmentDate <= nextWeek;
    });

    // Calculate stats for today
    const todayConfirmed = filteredTodayAppointments.filter(apt => apt.status === 'CONFIRMED').length;
    const todayInProgress = filteredTodayAppointments.filter(apt => apt.status === 'IN_PROGRESS').length;
    const todayCompleted = filteredTodayAppointments.filter(apt => apt.status === 'COMPLETED').length;

    const getStatusColor = (status) => {
      switch (status) {
        case 'SCHEDULED':
          return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        case 'CONFIRMED':
          return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        case 'IN_PROGRESS':
          return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
        case 'COMPLETED':
          return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        case 'CANCELLED':
          return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        default:
          return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      }
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, Dr. {user.name}</h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your practice today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={user.isAvailable ? "default" : "secondary"}
              className="text-sm px-4 py-2"
            >
              {user.isAvailable ? (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Available
                </>
              ) : (
                'Offline'
              )}
            </Badge>
            <Link href="/dashboard/availability">
              <Button variant="outline">Manage Availability</Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Appointments Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Today's Appointments
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {filteredTodayAppointments.length}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      {todayConfirmed} confirmed
                    </span>
                  
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Completed Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Completed
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {stats.completedAppointments}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalAppointments} total appointments
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Your Rating
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {stats.rating?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalReviews || 0} reviews
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earnings Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Earnings
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    KSh {stats.totalEarnings?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.creditBalance || 0} credits available
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Schedule - {format(new Date(), 'MMMM d, yyyy')}</CardTitle>
            <Link href="/dashboard/appointments">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {filteredTodayAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredTodayAppointments
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .slice(0, 5)
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                          {appointment.patient?.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-semibold">{appointment.patient?.name || 'Patient'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.startTime), 'h:mm a')}
                            </p>
                            {appointment.patient?.phone && (
                              <p className="text-xs text-muted-foreground">
                                • {appointment.patient.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.replace('_', ' ')}
                        </Badge>
                        <Link href={`/dashboard/appointments/${appointment.id}`}>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No appointments scheduled for today
                </p>
                <Link href="/dashboard/availability">
                  <Button variant="link" className="mt-2">
                    Set your availability
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredUpcomingAppointments.length > 0 ? (
                  filteredUpcomingAppointments
                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                    .slice(0, 3)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {appointment.patient?.name || 'Patient'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(appointment.startTime), 'EEE, MMM d • h:mm a')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {appointment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming appointments this week
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <AvailabilitySummary />
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Completion Rate
                  </span>
                  <span className="font-semibold">
                    {stats.totalAppointments > 0
                      ? Math.round(
                          (stats.completedAppointments / stats.totalAppointments) * 100
                        )
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.totalAppointments > 0
                          ? (stats.completedAppointments / stats.totalAppointments) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Average Rating</span>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">
                      {stats.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Total Reviews</span>
                  <span className="font-semibold text-lg">{stats.totalReviews || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Upcoming Appointments</span>
                  <span className="font-semibold text-lg">{stats.upcomingAppointments || 0}</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Available Credits</span>
                  <span className="font-semibold text-lg">{stats.creditBalance || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )

  } catch (error) {
    console.error('Error loading dashboard:', error);
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">Error Loading Dashboard</h2>
          <p>There was an error loading your dashboard data. Please try refreshing the page.</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-2"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }
}

export default DoctorPage

