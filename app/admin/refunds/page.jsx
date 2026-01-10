"use client";

import { useState, useEffect } from "react";
import { getAllRefunds, approveRefund, rejectRefund } from "@/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    const res = await getAllRefunds({ status: "PENDING" });
    if (res.success) setRefunds(res.refunds || []);
    else toast.error("Failed to load refunds");
    setLoading(false);
  };

  const handleApprove = async (id) => {
    if (!confirm("Approve refund?")) return;
    const res = await approveRefund(id);
    if (res.success) {
      toast.success("Refund approved");
      fetchRefunds();
    } else toast.error(res.error || "Failed");
  };

  const handleReject = async (id) => {
    const notes = prompt("Reason for rejection:") || "";
    const res = await rejectRefund(id, notes);
    if (res.success) {
      toast.success("Refund rejected");
      fetchRefunds();
    } else toast.error(res.error || "Failed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refund Requests</h1>
        <p className="text-muted-foreground">
          Review and process pending refund requests.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Refunds</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Appointment</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.user?.name || r.userId}</TableCell>
                  <TableCell>{r.appointmentId}</TableCell>
                  <TableCell>{r.refundedCredits}</TableCell>
                  <TableCell>
                    {new Date(r.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(r.id)}>
                        Approve
                      </Button>
                      <Button size="sm" onClick={() => handleReject(r.id)}>
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
