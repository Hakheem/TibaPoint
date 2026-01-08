// app/dashboard/earnings/page.jsx
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
  AlertCircle
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
  Bar
} from 'recharts'

import { getDoctorEarnings, getEarningsStatistics, requestWithdrawal } from '@/actions/earnings'

export default function DoctorEarningsPage() {
  const [dateRange, setDateRange] = useState()
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    totalPlatformEarnings: 0,
    totalConsultations: 0,
    recentAppointments: [],
    allAppointments: []
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
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [processing, setProcessing] = useState(false)

  // Load data on mount and when dateRange changes
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

      const [earningsResult, monthlyStatsResult] = await Promise.all([
        getDoctorEarnings(filters),
        getEarningsStatistics('month')
      ])

      if (earningsResult.success) {
        setEarnings(earningsResult.earnings)
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

  const handleWithdrawalRequest = async () => {
    try {
      setProcessing(true)
      const amount = parseFloat(withdrawalAmount || 0)
      const result = await requestWithdrawal(amount)
      
      if (result.success) {
        alert(result.message)
        await loadData() // Refresh data
        setWithdrawalAmount('')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to request withdrawal:', error)
      alert('Failed to submit withdrawal request')
    } finally {
      setProcessing(false)
    }
  }

  const handleExportReport = () => {
    alert('Export feature would be implemented here')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading earnings data...</p>
        </div>
      </div>
    )
  }

  const weeklyAverage = monthlyStats.totalEarnings / 4
  const dailyAverage = monthlyStats.totalEarnings / 30

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Earnings Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Track your earnings, consultations, and financial performance
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

      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">
                  KSh {earnings.totalEarnings.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+12% from last month</span>
                </div>
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
                <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">
                  KSh {earnings.pendingEarnings.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <CreditCard className="h-3 w-3" />
                  <span>Ready for withdrawal</span>
                </div>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Earnings</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">
                  KSh {earnings.pendingEarnings.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>Payouts every Monday</span>
                </div>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
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
                  {earnings.totalConsultations}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Users className="h-3 w-3" />
                  <span>Completed appointments</span>
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
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payouts</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Trend</CardTitle>
              <CardDescription>Monthly earnings from completed consultations</CardDescription>
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
                      tickFormatter={(value) => `KSh ${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Earnings']}
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

          {/* Recent Earnings & Performance Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Earnings</CardTitle>
                <CardDescription>Latest completed consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {earnings.recentAppointments.length > 0 ? (
                    earnings.recentAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                            {appointment.patient?.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {appointment.patient?.name || 'Patient'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(appointment.completedAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            KSh {Math.round(appointment.doctorEarnings || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            30-min consultation
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No recent earnings</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <a href="/dashboard/appointments">View All Appointments</a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Statistics</CardTitle>
                <CardDescription>Monthly averages and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                      <p className="text-2xl font-bold">
                        KSh {monthlyStats.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Monthly Consultations</p>
                      <p className="text-2xl font-bold">{monthlyStats.totalConsultations}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Average per Consultation</p>
                      <p className="text-2xl font-bold">
                        KSh {Math.round(monthlyStats.avgEarningsPerConsultation).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Weekly Average</p>
                      <p className="text-2xl font-bold">
                        KSh {Math.round(weeklyAverage).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium">Consultation Distribution</p>
                      <Badge variant="outline">This Month</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Video Consultations</span>
                        <span className="font-medium">{monthlyStats.totalConsultations}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Next Payout</p>
                        <p className="text-xs text-muted-foreground">Every Monday</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          KSh {earnings.pendingEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Pending earnings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Detailed record of all your earnings</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <DateRangePicker 
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    className="w-full md:w-64"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDateRange(undefined)}
                  >
                    This Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date & Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Platform Fee</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Earnings</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.allAppointments.length > 0 ? (
                      earnings.allAppointments.map((appointment) => (
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
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs">
                                {appointment.patient?.name?.charAt(0) || 'P'}
                              </div>
                              <span className="text-sm">{appointment.patient?.name || 'Patient'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              Video Call
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">30 mins</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            KSh {Math.round(appointment.platformEarnings || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-green-600">
                              KSh {Math.round(appointment.doctorEarnings || 0).toLocaleString()}
                            </div>
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
                Showing {Math.min(earnings.allAppointments.length, 10)} of {earnings.allAppointments.length} transactions
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
          <div id="withdrawal-section">
            <Card>
              <CardHeader>
                <CardTitle>Payout Information</CardTitle>
                <CardDescription>
                  Manage your earnings and withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Balance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-2xl md:text-3xl font-bold mt-2 text-green-600">
                          KSh {earnings.pendingEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ready for immediate withdrawal
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Pending Earnings</p>
                        <p className="text-2xl md:text-3xl font-bold mt-2 text-amber-600">
                          KSh {earnings.pendingEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Will be added next Monday
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                        <p className="text-2xl md:text-3xl font-bold mt-2">
                          KSh {(earnings.totalEarnings - earnings.pendingEarnings).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All-time total withdrawals
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Withdrawal Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Request Withdrawal</CardTitle>
                    <CardDescription>
                      Withdraw your available balance to your bank account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="font-medium">Available for Withdrawal</p>
                            <p className="text-2xl font-bold text-green-600">
                              KSh {earnings.pendingEarnings.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Minimum Amount</p>
                            <p className="font-medium">KSh 1,000</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Withdrawal Amount (KSH)
                          </label>
                          <input
                            type="number"
                            min="1000"
                            max={earnings.pendingEarnings || 0}
                            step="100"
                            placeholder="Enter amount"
                            className="w-full px-3 py-2 border rounded-md"
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Bank Account Details
                          </label>
                          <div className="p-3 border rounded-md space-y-2">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Bank:</span> Equity Bank
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Account:</span> 1234567890
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Name:</span> Dr. John Doe
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col md:flex-row justify-between gap-4">
                    <Button variant="outline" className="w-full md:w-auto">
                      Update Bank Details
                    </Button>
                    <Button 
                      onClick={handleWithdrawalRequest}
                      disabled={processing || !withdrawalAmount || parseFloat(withdrawalAmount) < 1000}
                      className="w-full md:w-auto"
                    >
                      {processing ? 'Processing...' : 'Submit Withdrawal Request'}
                    </Button>
                  </CardFooter>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

