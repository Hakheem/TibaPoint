"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Calendar, CreditCard } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { getDoctorPayouts, cancelPayoutRequest } from "@/actions/payout";

export function PayoutHistory({ filters }) {
  const [dateRange, setDateRange] = useState();
  const [payouts, setPayouts] = useState([]);
  const [statistics, setStatistics] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    loadPayouts();
  }, [dateRange, selectedStatus]);

  async function loadPayouts() {
    try {
      setLoading(true);
      
      const filterData = {};
      if (dateRange?.from) {
        filterData.startDate = dateRange.from.toISOString();
      }
      if (dateRange?.to) {
        filterData.endDate = dateRange.to.toISOString();
      }
      if (selectedStatus !== "ALL") {
        filterData.status = selectedStatus;
      }

      const result = await getDoctorPayouts(filterData);
      
      if (result.success) {
        setPayouts(result.payouts || []);
        setStatistics(result.statistics || {
          totalPaid: 0,
          totalPending: 0,
          totalRequests: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch payouts:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelRequest = async (payoutId) => {
    if (!confirm("Are you sure you want to cancel this payout request?")) return;

    try {
      const result = await cancelPayoutRequest(payoutId);
      if (result.success) {
        alert(result.message);
        await loadPayouts();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to cancel payout:", error);
      alert("Failed to cancel payout request");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { className: "bg-yellow-100 text-yellow-800", label: "Pending" },
      PROCESSING: { className: "bg-blue-100 text-blue-800", label: "Processing" },
      COMPLETED: { className: "bg-green-100 text-green-800", label: "Completed" },
      FAILED: { className: "bg-red-100 text-red-800", label: "Failed" },
      CANCELLED: { className: "bg-gray-100 text-gray-800", label: "Cancelled" },
    };

    const variant = variants[status] || variants.PENDING;
    return (
      <Badge className={`${variant.className} hover:${variant.className}`}>
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading payout history...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>
              Track your withdrawal requests and payments
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">
              KSh {statistics.totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Pending Amount</p>
            <p className="text-2xl font-bold text-amber-600">
              KSh {statistics.totalPending.toLocaleString()}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <p className="text-2xl font-bold">{statistics.totalRequests}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length > 0 ? (
                payouts.map((payout) => (
                  <tr key={payout.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {format(new Date(payout.createdAt), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(payout.createdAt), "h:mm a")}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono">
                      {payout.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">
                        KSh {payout.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {payout.payoutMethod.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="py-3 px-4">
                      {payout.status === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelRequest(payout.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No payout history found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
