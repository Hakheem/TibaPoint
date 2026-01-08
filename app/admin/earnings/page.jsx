// app/admin/earnings/page.jsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Download,
  Users,
  BarChart3,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Building,
  PieChart,
  Target,
  Shield
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'

import { getPlatformEarnings, getEarningsStatistics, processDoctorPayouts } from '@/actions/earnings'

export default function AdminEarningsPage() {
  const [dateRange, setDateRange] = useState()
  const [platformEarnings, setPlatformEarnings] = useState({
    totalPlatformEarnings: 0,
    totalDoctorEarnings: 0,
    totalRevenue: 0,
    totalConsultations: 0,
    appointments: [],
    earningsByDoctor: []
  })
  const [monthlyStats, setMonthlyStats] = useState({
    period: 'month',
    totalEarnings: 0,
    totalConsultations: 0,
    avgEarningsPerConsultation: 0,
    chartData: [],
    appointments: []
  })
  const [loading, setLoading] = useState(true)
  const [processingPayouts, setProcessingPayouts] = useState(false)

  useEffect(() => {
    loadData()
  }, [dateRange])

  async function loadData() {
    try {
      setLoading(true)
      
      const filters = {}
      if (dateRange?.from) {
        filters.startDate = dateRange.from.toISOString()
      }
      if (dateRange?.to) {
        filters.endDate = dateRange.to.toISOString()
      }

      const [platformResult, monthlyStatsResult] = await Promise.all([
        getPlatformEarnings(filters),
        getEarningsStatistics('month')
      ])

      if (platformResult.success) {
        setPlatformEarnings(platformResult.earnings)
      }

      if (monthlyStatsResult.success) {
        setMonthlyStats(monthlyStatsResult.statistics)
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayouts = async () => {
    try {
      setProcessingPayouts(true)
      const result = await processDoctorPayouts()
      
      if (result.success) {
        alert(result.message)
        await loadData()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to process payouts:', error)
      alert('Failed to process payouts')
    } finally {
      setProcessingPayouts(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading platform earnings...</p>
        </div>
      </div>
    )
  }

  const doctorEarningsData = platformEarnings.earningsByDoctor
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 5)
    .map(doctor => ({
      name: doctor.doctorName,
      value: Math.round(doctor.totalEarnings),
      consultations: doctor.consultations
    }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Platform Earnings</h1>
          <p className="text-muted-foreground mt-2">
            Manage platform revenue, doctor payouts, and financial analytics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64">
            <DateRangePicker 
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
          {dateRange && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setDateRange(undefined)}
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      {/* Platform Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">
                  KSh {platformEarnings.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+18% from last month</span>
                </div>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Earnings</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">
                  KSh {platformEarnings.totalPlatformEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Net profit after doctor payouts
                </p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doctor Payouts</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">
                  KSh {platformEarnings.totalDoctorEarnings.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <CreditCard className="h-3 w-3" />
                  <span>Total doctor earnings</span>
                </div>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Consultations</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">
                  {platformEarnings.totalConsultations}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Users className="h-3 w-3" />
                  <span>Completed consultations</span>
                </div>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Doctors</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payouts</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue from consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyStats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      />
                      <YAxis 
                        tickFormatter={(value) => `KSh ${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doctor Earnings Distribution</CardTitle>
                <CardDescription>Top 5 earning doctors this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={doctorEarningsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {doctorEarningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Earnings']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key platform performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="space-y-2 text-center">
                  <div className="h-16 w-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">Commission Rate</p>
                  <p className="text-2xl font-bold">12%</p>
                  <p className="text-xs text-muted-foreground">Platform commission</p>
                </div>

                <div className="space-y-2 text-center">
                  <div className="h-16 w-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Growth Rate</p>
                  <p className="text-2xl font-bold">18%</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>Monthly growth</span>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <div className="h-16 w-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <PieChart className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium">Profit Margin</p>
                  <p className="text-2xl font-bold">24%</p>
                  <p className="text-xs text-muted-foreground">Net profit margin</p>
                </div>

                <div className="space-y-2 text-center">
                  <div className="h-16 w-16 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium">Active Doctors</p>
                  <p className="text-2xl font-bold">{platformEarnings.earningsByDoctor.length}</p>
                  <p className="text-xs text-muted-foreground">Generating revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Doctor Earnings Report</CardTitle>
                  <CardDescription>Detailed earnings breakdown by doctor</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <DateRangePicker 
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    className="w-full md:w-64"
                  />
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Doctor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Speciality</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Consultations</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Doctor Earnings</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Platform Earnings</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total Revenue</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg per Consultation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformEarnings.earningsByDoctor.length > 0 ? (
                      platformEarnings.earningsByDoctor
                        .sort((a, b) => b.totalEarnings - a.totalEarnings)
                        .map((doctor) => (
                          <tr key={doctor.doctorId} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs">
                                  {doctor.doctorName?.charAt(0) || 'D'}
                                </div>
                                <span className="font-medium">{doctor.doctorName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{doctor.doctorSpeciality}</Badge>
                            </td>
                            <td className="py-3 px-4 font-medium">{doctor.consultations}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-green-600">
                                KSh {Math.round(doctor.totalEarnings).toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              KSh {Math.round(doctor.totalEarnings * 0.12).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-semibold">
                              KSh {Math.round(doctor.totalEarnings / 0.88).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              KSh {Math.round(doctor.totalEarnings / doctor.consultations).toLocaleString()}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-12 text-center">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No doctor earnings data</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {platformEarnings.earningsByDoctor.length} doctors
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>All Transactions</CardTitle>
                  <CardDescription>Complete platform transaction history</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <DateRangePicker 
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    className="w-full md:w-64"
                  />
                  {dateRange && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDateRange(undefined)}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date & Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Doctor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Consultation Fee</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Doctor Payout</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Platform Earnings</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformEarnings.appointments.length > 0 ? (
                      platformEarnings.appointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              {format(new Date(appointment.completedAt), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(appointment.completedAt), 'h:mm a')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">{appointment.patient?.name || 'Patient'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">Dr. {appointment.doctor?.name}</div>
                            <div className="text-xs text-muted-foreground">{appointment.doctor?.speciality}</div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            KSh {Math.round(appointment.packagePrice || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-green-600">
                              KSh {Math.round(appointment.doctorEarnings || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-blue-600">
                            KSh {Math.round(appointment.platformEarnings || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-12 text-center">
                          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No transactions found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(platformEarnings.appointments.length, 10)} of {platformEarnings.appointments.length} transactions
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Payout Management</CardTitle>
              <CardDescription>Process and manage doctor earnings payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payout Processing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Process Weekly Payouts</CardTitle>
                  <CardDescription>Process pending earnings for all active doctors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">Next Payout Cycle</p>
                          <p className="text-sm text-muted-foreground">Scheduled for every Monday</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {format(new Date().setDate(new Date().getDate() + (8 - new Date().getDay()) % 7), 'MMMM d')}
                          </p>
                          <p className="text-sm text-muted-foreground">Next payout date</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Doctors with Pending Earnings</p>
                        <p className="text-2xl font-bold mt-2">
                          {platformEarnings.earningsByDoctor.filter(d => d.totalEarnings > 0).length}
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Pending Amount</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          KSh {platformEarnings.totalDoctorEarnings.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Last Payout Date</p>
                        <p className="text-2xl font-bold mt-2">
                          {format(new Date().setDate(new Date().getDate() - 7), 'MMM d')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">Process Payouts Now</p>
                          <p className="text-sm text-muted-foreground">
                            This will add pending earnings to doctors' balances
                          </p>
                        </div>
                        <Button 
                          onClick={handleProcessPayouts}
                          disabled={processingPayouts}
                          className="gap-2 w-full md:w-auto"
                        >
                          <CreditCard className="h-4 w-4" />
                          {processingPayouts ? 'Processing...' : 'Process All Payouts'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

