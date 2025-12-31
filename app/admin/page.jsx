import { checkUser } from '@/lib/checkUser'
import { redirect } from 'next/navigation'
import { getDashboardStats, getUpcomingAppointments, getPendingDoctors } from '@/actions/admin'
import DashboardStats from './_components/DashboardStats'
import RecentActivity from './_components/RecentActivity'
import PendingDoctors from './_components/PendingDoctors'
import UpcomingAppointments from './_components/UpcomingAppointments'

export const metadata = {
  title: 'Admin Dashboard - TibaPoint',
  description: 'Admin dashboard overview',
}

export default async function AdminDashboardPage() {
  const user = await checkUser()

  // fetch data in parallel
  const [statsData, upcomingData, pendingData] = await Promise.all([
    getDashboardStats(),
    getUpcomingAppointments(),
    getPendingDoctors()
  ])

  const stats = statsData.success ? statsData.stats : null
  const upcomingAppointments = upcomingData.success ? upcomingData.appointments : []
  const pendingDoctors = pendingData.success ? pendingData.doctors : []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here's what's happening with your platform today.
        </p>
      </div>

      {/* Dashboard Stats */}
      {stats && <DashboardStats stats={stats} />}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Doctors (Verification) */}
          <PendingDoctors doctors={pendingDoctors} />

          {/* Upcoming Appointments */}
          <UpcomingAppointments appointments={upcomingAppointments} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <RecentActivity />

         
        </div>
      </div>
    </div>
  )
}

