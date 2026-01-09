"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CreditCard, Clock, Users, ArrowUpRight } from "lucide-react";

export function EarningsOverview({ earnings, balance }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </p>
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
              <p className="text-sm font-medium text-muted-foreground">
                Available Balance
              </p>
              <p className="text-2xl md:text-3xl font-bold mt-2">
                KSh {balance.availableBalance.toLocaleString()}
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
              <p className="text-sm font-medium text-muted-foreground">
                Pending Earnings
              </p>
              <p className="text-2xl md:text-3xl font-bold mt-2">
                KSh {balance.pendingAmount.toLocaleString()}
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
              <p className="text-sm font-medium text-muted-foreground">
                Total Consultations
              </p>
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
  );
}

