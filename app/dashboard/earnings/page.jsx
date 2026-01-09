"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  BarChart3,
  CreditCard,
  Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getDoctorEarnings,
  getEarningsStatistics,
} from "@/actions/earnings";

import {
  getDoctorBalance,
} from "@/actions/payout";

import { WithdrawalSection } from "@/components/doctor/WithdrawalSection";
import { PayoutHistory } from "@/components/doctor/PayoutHistory";
import { EarningsOverview } from "@/components/doctor/EarningsOverview";
import { TransactionsTable } from "@/components/doctor/TransactionsTable";

export default function DoctorEarningsPage() {
  const [dateRange, setDateRange] = useState();
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    totalPlatformEarnings: 0,
    totalConsultations: 0,
    recentAppointments: [],
    allAppointments: [],
  });
  const [balance, setBalance] = useState({
    totalBalance: 0,
    pendingAmount: 0,
    availableBalance: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState({
    period: "month",
    totalEarnings: 0,
    totalConsultations: 0,
    avgEarningsPerConsultation: 0,
    chartData: [],
    appointments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  async function loadData() {
    try {
      setLoading(true);

      const filters = {};
      if (dateRange?.from) {
        filters.startDate = dateRange.from.toISOString();
      }
      if (dateRange?.to) {
        filters.endDate = dateRange.to.toISOString();
      }

      const [earningsResult, monthlyStatsResult, balanceResult] = await Promise.all([
        getDoctorEarnings(filters),
        getEarningsStatistics("month"),
        getDoctorBalance(),
      ]);

      if (earningsResult.success) {
        setEarnings(earningsResult.earnings);
      }

      if (monthlyStatsResult.success) {
        setMonthlyStats(monthlyStatsResult.statistics);
      }

      if (balanceResult.success) {
        setBalance(balanceResult.balance);
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleExportReport = () => {
    alert("Export feature would be implemented here");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  const weeklyAverage = monthlyStats.totalEarnings / 4;
  const dailyAverage = monthlyStats.totalEarnings / 30;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Earnings Dashboard</h1>
          <p className="text-muted-foreground mt-2">
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

      <EarningsOverview 
        earnings={earnings}
        balance={balance}
      />

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
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payouts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Earnings Trend</h3>
                  <p className="text-sm text-muted-foreground">
                    Monthly earnings from completed consultations
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), "MMM d")}
                    />
                    <YAxis
                      tickFormatter={(value) => `KSh ${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `KSh ${value.toLocaleString()}`,
                        "Earnings",
                      ]}
                      labelFormatter={(label) =>
                        format(new Date(label), "MMM d, yyyy")
                      }
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Earnings</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {earnings.recentAppointments.length > 0 ? (
                    earnings.recentAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                            {appointment.patient?.name?.charAt(0) || "P"}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {appointment.patient?.name || "Patient"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(appointment.completedAt),
                                "MMM d, h:mm a"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            KSh{" "}
                            {Math.round(
                              appointment.doctorEarnings || 0
                            ).toLocaleString()}
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
                      <p className="text-muted-foreground">
                        No recent earnings
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Statistics</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Monthly Earnings
                      </p>
                      <p className="text-2xl font-bold">
                        KSh {monthlyStats.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Monthly Consultations
                      </p>
                      <p className="text-2xl font-bold">
                        {monthlyStats.totalConsultations}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Average per Consultation
                      </p>
                      <p className="text-2xl font-bold">
                        KSh{" "}
                        {Math.round(
                          monthlyStats.avgEarningsPerConsultation
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Weekly Average
                      </p>
                      <p className="text-2xl font-bold">
                        KSh {Math.round(weeklyAverage).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTable appointments={earnings.allAppointments} />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <WithdrawalSection 
            availableBalance={balance.availableBalance}
            onWithdrawalSuccess={loadData}
          />
          <PayoutHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

