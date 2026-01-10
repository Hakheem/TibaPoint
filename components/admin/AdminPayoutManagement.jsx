"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertCircle, CheckCircle, Eye, Download } from "lucide-react";
import {  
  markPayoutAsProcessing, 
  completePayoutRequest, 
  markPayoutAsFailed 
} from "@/actions/payout";
import { format } from "date-fns";

export function AdminPayoutManagement({ payouts, onUpdate }) {
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [notes, setNotes] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [failureReason, setFailureReason] = useState("");

  const handleMarkAsProcessing = async (payoutId) => {
    try {
      setProcessing(payoutId);
      const result = await markPayoutAsProcessing(payoutId, notes);
      
      if (result.success) {
        alert("Payout marked as processing");
        onUpdate();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to update payout:", error);
      alert("Failed to update payout");
    } finally {
      setProcessing(null);
      setNotes("");
    }
  };

  const handleCompletePayout = async (payoutId) => {
    if (!transactionRef.trim()) {
      alert("Please enter a transaction reference");
      return;
    }

    try {
      setProcessing(payoutId);
      const result = await completePayoutRequest({
        payoutId,
        transactionRef,
        adminNotes: notes,
      });

      if (result.success) {
        alert("Payout completed successfully");
        onUpdate();
        setSelectedPayout(null);
        setTransactionRef("");
        setNotes("");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to complete payout:", error);
      alert("Failed to complete payout");
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkAsFailed = async (payoutId) => {
    if (!failureReason.trim()) {
      alert("Please enter a failure reason");
      return;
    }

    try {
      setProcessing(payoutId);
      const result = await markPayoutAsFailed({
        payoutId,
        failureReason,
        adminNotes: notes,
      });

      if (result.success) {
        alert("Payout marked as failed");
        onUpdate();
        setSelectedPayout(null);
        setFailureReason("");
        setNotes("");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to mark payout as failed:", error);
      alert("Failed to update payout");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "FAILED": return "bg-red-100 text-red-800";
      case "CANCELLED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payout Requests Management</CardTitle>
          <CardDescription>
            Review and process doctor payout requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Doctor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Requested</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs">
                          {payout.doctor?.name?.charAt(0) || "D"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{payout.doctor?.name}</p>
                          <p className="text-xs text-muted-foreground">{payout.doctor?.speciality}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">
                        KSh {payout.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {payout.payoutMethod.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(payout.status)}>
                        {payout.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {format(new Date(payout.createdAt), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(payout.createdAt), "h:mm a")}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPayout(payout)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payout.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsProcessing(payout.id)}
                            disabled={processing === payout.id}
                          >
                            {processing === payout.id ? "Processing..." : "Mark as Processing"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedPayout && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Payout: {selectedPayout.id.slice(0, 8)}...</CardTitle>
            <CardDescription>
              Doctor: {selectedPayout.doctor?.name} • Amount: KSh {selectedPayout.amount.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this payout..."
              />
            </div>

            {selectedPayout.status === "PROCESSING" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Transaction Reference *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter transaction reference (e.g., MPESA code)"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCompletePayout(selectedPayout.id)}
                    disabled={!transactionRef.trim() || processing === selectedPayout.id}
                  >
                    {processing === selectedPayout.id ? "Completing..." : "Mark as Completed"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPayout(null);
                      setNotes("");
                      setTransactionRef("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {(selectedPayout.status === "PENDING" || selectedPayout.status === "PROCESSING") && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Failure Reason *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    placeholder="Enter reason for failure"
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleMarkAsFailed(selectedPayout.id)}
                  disabled={!failureReason.trim() || processing === selectedPayout.id}
                >
                  {processing === selectedPayout.id ? "Updating..." : "Mark as Failed"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

