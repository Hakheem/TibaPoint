"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { requestPayout, getDoctorBalance } from "@/actions/payout";

export function WithdrawalSection({ onWithdrawalSuccess }) {
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("MPESA");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tillNumber, setTillNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Add state for doctor's balance
  const [doctorBalance, setDoctorBalance] = useState({
    availableBalance: 0,
    totalBalance: 0,
    pendingAmount: 0
  });
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Fetch doctor's balance on component mount
  useEffect(() => {
    fetchDoctorBalance();
  }, []);

  const fetchDoctorBalance = async () => {
    try {
      setLoadingBalance(true);
      const result = await getDoctorBalance();
      
      if (result.success) {
        setDoctorBalance(result.balance || {
          availableBalance: 0,
          totalBalance: 0,
          pendingAmount: 0
        });
      } else {
        setError(result.error || "Failed to load balance");
      }
    } catch (error) {
      console.error("Failed to fetch doctor balance:", error);
      setError("Failed to load balance information");
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleWithdrawal = async () => {
    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      const result = await requestPayout({
        amount: parseFloat(amount),
        payoutMethod,
        phoneNumber: (payoutMethod === "MPESA" || payoutMethod === "AIRTEL_MONEY") ? phoneNumber : undefined,
        tillNumber: payoutMethod === "TILL_NUMBER" ? tillNumber : undefined,
        recipientName,
        doctorNotes,
        detailsConfirmed,
      });

      if (result.success) {
        setSuccess(result.message || "Payout request submitted successfully");
        setAmount("");
        setDoctorNotes("");
        setDetailsConfirmed(false);
        // Refresh the doctor's balance
        await fetchDoctorBalance();
        onWithdrawalSuccess();
      } else {
        setError(result.error || "Failed to submit payout request");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Withdrawal error:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Calculate available balance for withdrawal
  const availableBalance = doctorBalance.availableBalance || 0;
  const canWithdraw = availableBalance >= 1000;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Withdrawal</CardTitle>
        <CardDescription>
          Withdraw your available balance to your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <p>{success}</p>
          </div>
        )}

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Available for Withdrawal</p>
              {loadingBalance ? (
                <div className="h-10 flex items-center">
                  <div className="animate-pulse bg-gray-200 rounded h-8 w-32"></div>
                </div>
              ) : (
                <p className={`text-2xl font-bold ${canWithdraw ? 'text-green-600' : 'text-amber-600'}`}>
                  KSh {availableBalance.toLocaleString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Minimum Amount</p>
              <p className="font-medium">KSh 1,000</p>
              {!loadingBalance && !canWithdraw && availableBalance > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Need KSh {(1000 - availableBalance).toLocaleString()} more
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Withdrawal Amount (KSH)
            </label>
            <input
              type="number"
              min="1000"
              max={availableBalance}
              step="100"
              placeholder="Enter amount"
              className="w-full px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!canWithdraw}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {loadingBalance ? (
                "Loading balance..."
              ) : canWithdraw ? (
                <>Minimum: KSh 1,000 • Maximum: KSh {availableBalance.toLocaleString()}</>
              ) : (
                <span className="text-amber-600">
                  {availableBalance > 0 ? (
                    `Need KSh ${(1000 - availableBalance).toLocaleString()} more to withdraw`
                  ) : (
                    "No available balance for withdrawal"
                  )}
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Method
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
              disabled={!canWithdraw}
            >
              <option value="MPESA">M-Pesa</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="TILL_NUMBER">Till Number</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          {(payoutMethod === "MPESA" || payoutMethod === "AIRTEL_MONEY") && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="0712345678"
                className="w-full px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!canWithdraw}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: 0712345678 or +254712345678
              </p>
            </div>
          )}

          {payoutMethod === "TILL_NUMBER" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Till Number
              </label>
              <input
                type="text"
                placeholder="123456"
                className="w-full px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                value={tillNumber}
                onChange={(e) => setTillNumber(e.target.value)}
                disabled={!canWithdraw}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Recipient Name (as it appears on account)
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              disabled={!canWithdraw}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Add any notes for the admin..."
              className="w-full px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              rows={3}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              disabled={!canWithdraw}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="confirmDetails"
              checked={detailsConfirmed}
              onChange={(e) => setDetailsConfirmed(e.target.checked)}
              className="h-4 w-4 disabled:opacity-50"
              disabled={!canWithdraw}
            />
            <label htmlFor="confirmDetails" className="text-sm">
              I confirm that the payment details provided are correct
            </label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {loadingBalance ? (
          <Button disabled className="w-full">
            Loading balance...
          </Button>
        ) : canWithdraw ? (
          <Button
            onClick={handleWithdrawal}
            disabled={
              processing ||
              !amount ||
              parseFloat(amount) < 1000 ||
              parseFloat(amount) > availableBalance ||
              !recipientName ||
              !detailsConfirmed
            }
            className="w-full"
          >
            {processing ? "Submitting..." : "Submit Withdrawal Request"}
          </Button>
        ) : (
          <Button
            disabled
            className="w-full bg-gray-100 text-gray-600 hover:bg-gray-100 cursor-not-allowed"
          >
            {availableBalance > 0 
              ? `Need KSh ${(1000 - availableBalance).toLocaleString()} more to withdraw`
              : "No available balance for withdrawal"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

