"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'
import { getAllPayouts } from '@/actions/payout'
import { getPlatformEarnings, getEarningsStatistics, processDoctorPayouts } from '@/actions/earnings'
import { AdminPayoutManagement } from '@/components/admin/AdminPayoutManagement'


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
  const [allPayouts, setAllPayouts] = useState([])
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

      const [platformResult, monthlyStatsResult, payoutsResult] = await Promise.all([
        getPlatformEarnings(filters),
        getEarningsStatistics('month'),
        getAllPayouts(filters)
      ])

      if (platformResult.success) {
        setPlatformEarnings(platformResult.earnings)
      }

      if (monthlyStatsResult.success) {
        setMonthlyStats(monthlyStatsResult.statistics)
      }

      if (payoutsResult.success) {
        setAllPayouts(payoutsResult.payouts || [])
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
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payouts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Payout Management</CardTitle>
              <CardDescription>Process and manage doctor earnings payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

          <AdminPayoutManagement 
            payouts={allPayouts}
            onUpdate={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

