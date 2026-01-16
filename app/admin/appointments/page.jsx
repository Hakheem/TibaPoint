"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  DollarSign,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAllAppointmentsAdmin } from "@/actions/appointments";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statistics, setStatistics] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    scheduled: 0,
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeTab, searchQuery]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const result = await getAllAppointmentsAdmin();

      if (result.success) {
        setAppointments(result.appointments || []);
        setStatistics(
          result.statistics || {
            total: 0,
            upcoming: 0,
            completed: 0,
            cancelled: 0,
            scheduled: 0,
          },
        );
        toast.success("Appointments loaded successfully");
      } else {
        toast.error("Failed to load appointments");
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by status/tab
    if (activeTab === "upcoming") {
      filtered = filtered.filter(
        (a) => a.status === "SCHEDULED" || a.status === "CONFIRMED",
      );
    } else if (activeTab === "completed") {
      filtered = filtered.filter((a) => a.status === "COMPLETED");
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter((a) => a.status === "CANCELLED");
    } else if (activeTab === "in-progress") {
      filtered = filtered.filter((a) => a.status === "IN_PROGRESS");
    }

    // Filter by search query (patient name, doctor name, email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.patient?.name?.toLowerCase().includes(query) ||
          a.patient?.email?.toLowerCase().includes(query) ||
          a.doctor?.name?.toLowerCase().includes(query) ||
          a.doctor?.email?.toLowerCase().includes(query),
      );
    }

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-cyan-100 text-cyan-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      SCHEDULED: "Scheduled",
      CONFIRMED: "Confirmed",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Platform Appointments</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all platform appointments
          </p>
        </div>
        <Button onClick={loadAppointments} variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold mt-1">{statistics.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold mt-1">{statistics.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold mt-1">
                  {statistics.scheduled}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1">
                  {statistics.completed}
                </p>
              </div>
              <Stethoscope className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold mt-1">
                  {statistics.cancelled}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>
                {filteredAppointments.length} appointments found
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by patient, doctor, or email..."
                className="pl-10 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({statistics.total})</TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({statistics.upcoming})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress ({statistics.scheduled})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({statistics.completed})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({statistics.cancelled})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="overflow-x-auto">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No appointments found
                    </h3>
                    <p className="text-gray-500">
                      {activeTab === "all"
                        ? "There are no appointments in the system."
                        : `No ${activeTab} appointments found.`}
                    </p>
                  </div>
                ) : (
                  <table className="w-full min-w-[1200px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Patient
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Doctor
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Date & Time
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Earnings
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-sm">
                                {appointment.patient?.name || "Unknown Patient"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {appointment.patient?.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-sm">
                                {appointment.doctor?.name || "Unknown Doctor"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {appointment.doctor?.speciality}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm">
                                {format(
                                  new Date(appointment.startTime),
                                  "MMM d, yyyy",
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(appointment.startTime),
                                  "h:mm a",
                                )}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={getStatusColor(appointment.status)}
                            >
                              {getStatusLabel(appointment.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <p className="font-medium text-green-600">
                                Dr: KSh{" "}
                                {Math.round(
                                  appointment.doctorEarnings || 0,
                                ).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-600">
                                Plat: KSh{" "}
                                {Math.round(
                                  appointment.platformEarnings || 0,
                                ).toLocaleString()}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // TODO: Navigate to appointment details
                                toast.info(
                                  `View appointment ${appointment.id}`,
                                );
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
