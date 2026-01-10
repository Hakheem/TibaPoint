"use client";

import { useState, useEffect } from "react";
import {
  getAllPenalties,
  createPenalty,
  resolvePenalty,
} from "@/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    setLoading(true);
    const res = await getAllPenalties({ status: "ACTIVE" });
    if (res.success) setPenalties(res.penalties || []);
    else toast.error("Failed to load penalties");
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!doctorId || !reason) return toast.error("Doctor and reason required");
    const res = await createPenalty(
      doctorId,
      "MISCONDUCT",
      1,
      parseFloat(amount) || 0,
      reason
    );
    if (res.success) {
      toast.success("Penalty created");
      setDoctorId("");
      setReason("");
      setAmount("");
      fetchPenalties();
    } else toast.error(res.error || "Failed");
  };

  const handleResolve = async (id) => {
    const notes = prompt("Resolution notes:") || "";
    const res = await resolvePenalty(id, notes);
    if (res.success) {
      toast.success("Penalty resolved");
      fetchPenalties();
    } else toast.error(res.error || "Failed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Penalties</h1>
        <p className="text-muted-foreground">
          Issue and manage penalties for doctors.
        </p>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Issue Penalty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Input
              placeholder="Doctor ID"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            />
            <Input
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Penalties</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {penalties.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.doctor?.name || p.doctorId}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{p.creditsDeducted}</TableCell>
                  <TableCell>{p.amountDeducted}</TableCell>
                  <TableCell>{p.reason}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleResolve(p.id)}>
                        Resolve
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
