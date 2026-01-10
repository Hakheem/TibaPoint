"use client";

import { useState, useEffect } from "react";
import {
  getAllPatients,
  getPatientDetails,
  suspendPatient,
  unsuspendPatient,
  deletePatient,
  restorePatient,
  adjustPatientCredits,
} from "@/actions/admin";
import {
  addFamilyMemberAsAdmin,
  removeFamilyMemberAsAdmin,
} from "@/actions/family-members";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  BadgeCheck,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Users,
  FileText,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  X,
} from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAddFamilyMemberOpen, setIsAddFamilyMemberOpen] = useState(false);
  const [newFamilyMemberData, setNewFamilyMemberData] = useState({
    memberId: "",
    relationship: "other",
    nickname: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const res = await getAllPatients({ search });
    if (res.success) {
      setPatients(res.patients || []);
    } else {
      toast.error("Failed to load patients");
    }
    setLoading(false);
  };

  const handleView = async (id) => {
    const res = await getPatientDetails(id);
    if (res.success) setSelectedPatient(res.patient);
    else toast.error("Failed to load patient");
  };

  const handleSuspend = async (id) => {
    const reason = prompt("Reason for suspension:");
    if (!reason) return;
    const res = await suspendPatient(id, reason);
    if (res.success) {
      toast.success("Patient suspended");
      fetchPatients();
      if (selectedPatient?.id === id) handleView(id);
    } else toast.error(res.error || "Failed");
  };

  const handleUnsuspend = async (id) => {
    const res = await unsuspendPatient(id);
    if (res.success) {
      toast.success("Patient unsuspended");
      fetchPatients();
      if (selectedPatient?.id === id) handleView(id);
    } else toast.error(res.error || "Failed");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete patient?")) return;
    const res = await deletePatient(id);
    if (res.success) {
      toast.success("Patient deleted");
      fetchPatients();
      if (selectedPatient?.id === id) setSelectedPatient(null);
    } else toast.error(res.error || "Failed");
  };

  const handleRestore = async (id) => {
    const res = await restorePatient(id);
    if (res.success) {
      toast.success("Patient restored");
      fetchPatients();
      if (selectedPatient?.id === id) handleView(id);
    } else toast.error(res.error || "Failed");
  };

  const handleAdjustCredits = async (id) => {
    const amountStr = prompt("Amount (positive to add, negative to deduct):");
    if (!amountStr) return;
    const amount = parseInt(amountStr);
    if (isNaN(amount)) return toast.error("Invalid amount");
    const reason = prompt("Reason for adjustment:") || "";
    const res = await adjustPatientCredits(id, amount, reason);
    if (res.success) {
      toast.success("Credits adjusted");
      fetchPatients();
      if (selectedPatient?.id === id) handleView(id);
    } else toast.error(res.error || "Failed");
  };

  const handleAddFamilyMember = async () => {
    if (!newFamilyMemberData.memberId) {
      toast.error("Please select a patient to add as family member");
      return;
    }

    const res = await addFamilyMemberAsAdmin(
      selectedPatient.id,
      newFamilyMemberData.memberId,
      newFamilyMemberData.relationship,
      newFamilyMemberData.nickname
    );

    if (res.success) {
      toast.success("Family member added successfully");
      setIsAddFamilyMemberOpen(false);
      setNewFamilyMemberData({
        memberId: "",
        relationship: "other",
        nickname: "",
      });
      handleView(selectedPatient.id);
    } else {
      toast.error(res.error || "Failed to add family member");
    }
  };

  const handleRemoveFamilyMember = async (familyMemberId, memberName) => {
    if (!confirm(`Remove ${memberName} as family member?`)) return;
    
    const res = await removeFamilyMemberAsAdmin(
      selectedPatient.id,
      familyMemberId
    );
    
    if (res.success) {
      toast.success("Family member removed");
      handleView(selectedPatient.id);
    } else {
      toast.error(res.error || "Failed to remove");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (patient) => {
    if (patient.deletedAt) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Deleted
        </Badge>
      );
    }
    if (patient.suspendedAt) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Ban className="h-3 w-3" />
          Suspended
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const StarIcon = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <p className="text-muted-foreground">Search, view and manage patients.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Patients</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button onClick={fetchPatients} variant="outline">
              Search
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {p.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{p.email}</span>
                        </div>
                        {p.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{p.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(p)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium">
                          {p.creditPackages?.[0]?.credits || p.credits || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(p.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(p.id)}>
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAdjustCredits(p.id)}>
                          Adjust Credits
                        </Button>
                        {p.suspendedAt ? (
                          <Button size="sm" variant="secondary" onClick={() => handleUnsuspend(p.id)}>
                            Unsuspend
                          </Button>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => handleSuspend(p.id)}>
                            Suspend
                          </Button>
                        )}
                        {p.deletedAt ? (
                          <Button size="sm" variant="default" onClick={() => handleRestore(p.id)}>
                            Restore
                          </Button>
                        ) : (
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedPatient && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">{selectedPatient.name}</div>
                    <div className="text-sm text-muted-foreground">Patient Details</div>
                  </div>
                </CardTitle>
                <CardDescription className="mt-2">
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedPatient)}
                    <span className="text-sm">Member since {formatDate(selectedPatient.createdAt)}</span>
                  </div>
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="family">Family</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <div className="text-sm font-medium">{selectedPatient.name}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4" />
                          {selectedPatient.email}
                        </div>
                      </div>
                      {selectedPatient.phone && (
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" />
                            {selectedPatient.phone}
                          </div>
                        </div>
                      )}
                      {selectedPatient.city && (
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <div className="text-sm">
                            {selectedPatient.city}
                            {selectedPatient.country && `, ${selectedPatient.country}`}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BadgeCheck className="h-5 w-5" />
                        Account Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Account Status</Label>
                        <div>{getStatusBadge(selectedPatient)}</div>
                      </div>
                      {selectedPatient.suspendedAt && (
                        <div className="space-y-2">
                          <Label>Suspension Details</Label>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-medium">Suspended on:</span>{" "}
                              {formatDate(selectedPatient.suspendedAt)}
                            </div>
                            {selectedPatient.suspensionReason && (
                              <div>
                                <span className="font-medium">Reason:</span>{" "}
                                {selectedPatient.suspensionReason}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedPatient.deletedAt && (
                        <div className="space-y-2">
                          <Label>Deletion Date</Label>
                          <div className="text-sm">{formatDate(selectedPatient.deletedAt)}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CreditCard className="h-5 w-5" />
                        Credits & Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Available Credits</Label>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{selectedPatient.credits || 0}</span>
                          <span className="text-sm text-muted-foreground">credits</span>
                        </div>
                      </div>
                      {selectedPatient.stats && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Total Appointments</div>
                              <div className="text-2xl font-bold">{selectedPatient.stats.totalAppointments}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Completed</div>
                              <div className="text-2xl font-bold">{selectedPatient.stats.completedAppointments}</div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Completion Rate</div>
                            <div className="text-2xl font-bold">{selectedPatient.stats.completionRate.toFixed(1)}%</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Total Credits Spent</div>
                            <div className="text-2xl font-bold">{selectedPatient.stats.totalSpent}</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleAdjustCredits(selectedPatient.id)}>
                        Adjust Credits
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5" />
                        Credit Packages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedPatient.creditPackages?.length > 0 ? (
                        <div className="space-y-3">
                          {selectedPatient.creditPackages.slice(0, 3).map((pkg) => (
                            <div key={pkg.id} className="rounded-lg border p-3">
                              <div className="flex justify-between">
                                <div>
                                  <div className="font-medium">{pkg.packageType} Package</div>
                                  <div className="text-sm text-muted-foreground">
                                    {pkg.creditsRemaining} credits remaining
                                  </div>
                                  <div className="text-sm">Purchased {formatDate(pkg.purchasedAt)}</div>
                                </div>
                                <Badge variant={pkg.status === "ACTIVE" ? "default" : "secondary"}>
                                  {pkg.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">No credit packages purchased</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.appointmentsAsPatient?.length > 0 ? (
                      <div className="space-y-4">
                        {selectedPatient.appointmentsAsPatient.map((apt) => (
                          <div key={apt.id} className="rounded-lg border p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium">{formatDateTime(apt.startTime)}</span>
                                </div>
                                <div className="text-sm">
                                  with Dr. {apt.doctor?.name} - {apt.doctor?.speciality}
                                </div>
                                {apt.review && (
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <StarIcon
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < apt.review.rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">{apt.review.comment}</span>
                                  </div>
                                )}
                              </div>
                              <Badge
                                variant={
                                  apt.status === "COMPLETED"
                                    ? "default"
                                    : apt.status === "CANCELLED"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {apt.status}
                              </Badge>
                            </div>
                            {apt.creditsCharged && (
                              <div className="mt-2 flex items-center gap-2 text-sm">
                                <CreditCard className="h-4 w-4" />
                                <span>{apt.creditsCharged} credits</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">No appointments found</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="family" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Family Members</CardTitle>
                        <CardDescription>Manage family members who can share credits</CardDescription>
                      </div>
                      <Dialog open={isAddFamilyMemberOpen} onOpenChange={setIsAddFamilyMemberOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Users className="mr-2 h-4 w-4" />
                            Add Family Member
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Add Family Member</DialogTitle>
                            <DialogDescription>
                              Add another patient as a family member to share credits.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="member">Select Patient</Label>
                              <Select
                                value={newFamilyMemberData.memberId}
                                onValueChange={(value) =>
                                  setNewFamilyMemberData((prev) => ({
                                    ...prev,
                                    memberId: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Search for a patient..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {patients
                                    .filter(
                                      (p) =>
                                        p.id !== selectedPatient.id &&
                                        !selectedPatient.familyMembers?.some((fm) => fm.memberId === p.id) &&
                                        !selectedPatient.familyMemberOf?.some((fm) => fm.ownerId === p.id)
                                    )
                                    .map((patient) => (
                                      <SelectItem key={patient.id} value={patient.id}>
                                        <div className="flex flex-col">
                                          <span>{patient.name}</span>
                                          <span className="text-xs text-muted-foreground">{patient.email}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">Patients cannot be in multiple families</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="relationship">Relationship</Label>
                              <Select
                                value={newFamilyMemberData.relationship}
                                onValueChange={(value) =>
                                  setNewFamilyMemberData((prev) => ({
                                    ...prev,
                                    relationship: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="spouse">Spouse/Partner</SelectItem>
                                  <SelectItem value="child">Child</SelectItem>
                                  <SelectItem value="parent">Parent</SelectItem>
                                  <SelectItem value="sibling">Sibling</SelectItem>
                                  <SelectItem value="other">Other Relative</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="nickname">
                                Nickname (Optional)
                                <span className="text-xs font-normal text-muted-foreground ml-2">
                                  Display name for this family member
                                </span>
                              </Label>
                              <Input
                                id="nickname"
                                placeholder="e.g., Mom, Junior, etc."
                                value={newFamilyMemberData.nickname}
                                onChange={(e) =>
                                  setNewFamilyMemberData((prev) => ({
                                    ...prev,
                                    nickname: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddFamilyMemberOpen(false);
                                setNewFamilyMemberData({
                                  memberId: "",
                                  relationship: "other",
                                  nickname: "",
                                });
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAddFamilyMember} disabled={!newFamilyMemberData.memberId}>
                              Add Family Member
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.familyMembers?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPatient.familyMembers.map((fm) => (
                          <div key={fm.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{fm.member?.name}</span>
                                  {fm.nickname && (
                                    <Badge variant="outline" className="text-xs">
                                      {fm.nickname}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">{fm.member?.email}</div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant="secondary" className="capitalize">
                                    {fm.relationship}
                                  </Badge>
                                  <span className="text-muted-foreground">Added {formatDate(fm.addedAt)}</span>
                                </div>
                                {fm.isActive === false && (
                                  <Badge variant="destructive" className="mt-1">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveFamilyMember(fm.id, fm.member?.name)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No Family Members</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Add family members to share credits with them.
                        </p>
                        <Button className="mt-4" onClick={() => setIsAddFamilyMemberOpen(true)}>
                          <Users className="mr-2 h-4 w-4" />
                          Add Family Member
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedPatient.familyMemberOf?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Managed By
                      </CardTitle>
                      <CardDescription>This patient is a family member of these users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedPatient.familyMemberOf.map((fm) => (
                          <div key={fm.id} className="rounded-lg border p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                                <User className="h-5 w-5 text-secondary" />
                              </div>
                              <div className="space-y-1">
                                <div className="font-medium">{fm.owner?.name}</div>
                                <div className="text-sm text-muted-foreground">{fm.owner?.email}</div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant="secondary" className="capitalize">
                                    {fm.relationship}
                                  </Badge>
                                  {fm.nickname && (
                                    <span className="text-muted-foreground">Nickname: {fm.nickname}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Package Sharing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPatient.creditPackages?.filter(
                        (pkg) => pkg.packageType === "FAMILY" && pkg.status === "ACTIVE"
                      ).length > 0 ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                          <div className="flex items-center gap-3">
                            <BadgeCheck className="h-5 w-5 text-green-600" />
                            <div>
                              <div className="font-medium text-green-900">Active Family Package</div>
                              <div className="text-sm text-green-700">Credits can be shared with family members</div>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            {selectedPatient.creditPackages
                              .filter((pkg) => pkg.packageType === "FAMILY" && pkg.status === "ACTIVE")
                              .map((pkg) => (
                                <div key={pkg.id} className="rounded border bg-white p-3">
                                  <div className="text-sm font-medium">{pkg.consultations} Consultations</div>
                                  <div className="text-xs text-muted-foreground">
                                    {pkg.creditsRemaining} credits remaining
                                  </div>
                                  <div className="mt-2 text-xs">Expires {formatDate(pkg.expiresAt)}</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <div>
                              <div className="font-medium text-amber-900">No Active Family Package</div>
                              <div className="text-sm text-amber-700">
                                Family members cannot use shared credits without a Family package
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 text-sm">
                            Consider purchasing a Family package to enable credit sharing
                          </div>
                        </div>
                      )}

                      {selectedPatient.familyMembers?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Family Member Activity</h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-lg border p-3">
                              <div className="text-sm font-medium">Total Family Members</div>
                              <div className="text-2xl font-bold">{selectedPatient.familyMembers.length}</div>
                            </div>
                            <div className="rounded-lg border p-3">
                              <div className="text-sm font-medium">Active Members</div>
                              <div className="text-2xl font-bold">
                                {selectedPatient.familyMembers.filter((fm) => fm.isActive).length}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Credit Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.creditTransactions?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPatient.creditTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-1">
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDateTime(transaction.createdAt)}
                              </div>
                            </div>
                            <div
                              className={`font-medium ${
                                transaction.amount > 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {transaction.amount > 0 ? "+" : ""}
                              {transaction.amount} credits
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">No transactions found</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="text-sm text-muted-foreground">Patient ID: {selectedPatient.id}</div>
            <div className="flex gap-2">
              {selectedPatient.suspendedAt ? (
                <Button variant="default" onClick={() => handleUnsuspend(selectedPatient.id)}>
                  Unsuspend Patient
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => handleSuspend(selectedPatient.id)}>
                  Suspend Patient
                </Button>
              )}
              {selectedPatient.deletedAt ? (
                <Button variant="default" onClick={() => handleRestore(selectedPatient.id)}>
                  Restore Patient
                </Button>
              ) : (
                <Button variant="destructive" onClick={() => handleDelete(selectedPatient.id)}>
                  Delete Patient
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

