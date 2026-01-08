"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Package,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserPackageStatus } from "@/actions/checkout";

// Create an inner component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const result = await getUserPackageStatus();

        if (result.success && result.data) {
          setPackageData(result.data);
        } else {
          setError("Failed to load package details");
        }
      } catch (err) {
        console.error("Error fetching package:", err);
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    // Check for payment status in URL params if needed
    const paymentId = searchParams.get("payment_id");
    const sessionId = searchParams.get("session_id");

    // Wait a bit for webhook to process
    setTimeout(fetchPackageData, 2000);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-semibold">Processing your payment...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-lg font-semibold mb-2">{error}</p>
            <Button onClick={() => router.push("/pricing")} className="mt-4">
              Return to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add null check for packageData before accessing properties
  const activePackage = packageData?.activePackage || null;
  const consultationsAvailable = packageData?.consultationsAvailable || 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blue-100 via-blue-50 to-transparent dark:from-primary/20 via-primary/10 to-transparent p-4 py-20 md:pt-0 lg:py-24 ">
      <Card className="w-full bg-gray-50 dark:bg-gray-900 max-w-3xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Payment Successful
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Your package has been activated and is ready to use
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Package Details - Only show if activePackage exists */}
          {activePackage && (
            <div className="bg-linear-to-br from-primary/5 to-blue-50/50 dark:from-primary/10 dark:to-slate-800/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Package
                    </p>
                    <p className="font-bold text-xl">
                      {activePackage.name || activePackage.type}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Consultations
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {activePackage.consultations || 0}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    Remaining
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.floor(activePackage.consultationsRemaining || 0)}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Used</p>
                  <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                    {Math.floor(activePackage.consultationsUsed || 0)}
                  </p>
                </div>
              </div>

              {activePackage.validUntil && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Valid until{" "}
                    {new Date(activePackage.validUntil).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Current Balance */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Available Consultations
                </span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {consultationsAvailable}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => router.push("/doctors")}
              className="flex-1 bg-linear-to-r from-blue-600 to-teal-500 text-white"
              size="lg"
            >
              Book a Consultation
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 dark:bg-slate-800/50 rounded-lg p-4 mt-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-black dark:text-white">
                What's next?
              </span>
              <br />
              You can now book consultations with any verified doctor on our
              platform. Each consultation uses 2 credits (1 consultation). Your
              package is valid for 30 days from today.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-semibold">
                Loading payment details...
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
