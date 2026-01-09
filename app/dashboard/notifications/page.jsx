"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Calendar, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  Shield,
  Clock,
  Trash2,
  CheckCheck,
  Filter,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { 
  getUserNotifications, 
  getNotificationsByRole,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationStatistics
} from "@/actions/notifications";

export default function DoctorNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    unread: 0,
    read: 0,
    recent: 0,
    byType: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeTab, selectedType, searchQuery]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notifsResult, statsResult] = await Promise.all([
        getNotificationsByRole(),
        getNotificationStatistics()
      ]);

      if (notifsResult.success) {
        setNotifications(notifsResult.notifications || []);
      }

      if (statsResult.success) {
        setStatistics(statsResult.statistics);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filter by tab
    if (activeTab === "unread") {
      filtered = filtered.filter(n => !n.isRead);
    } else if (activeTab === "read") {
      filtered = filtered.filter(n => n.isRead);
    }

    // Filter by type
    if (selectedType !== "ALL") {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setProcessing(notificationId);
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );
        loadNotifications(); // Refresh statistics
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setProcessing("all");
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
        );
        loadNotifications(); // Refresh statistics
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      setProcessing(notificationId);
      const result = await deleteNotification(notificationId);
      if (result.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        loadNotifications(); // Refresh statistics
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteRead = async () => {
    if (!confirm("Are you sure you want to delete all read notifications?")) return;

    try {
      setProcessing("delete-read");
      const result = await deleteReadNotifications();
      if (result.success) {
        setNotifications(prev => prev.filter(n => !n.isRead));
        loadNotifications(); // Refresh statistics
      }
    } catch (error) {
      console.error("Failed to delete read notifications:", error);
    } finally {
      setProcessing(null);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      APPOINTMENT: Calendar,
      REMINDER: Clock,
      REVIEW: Star,
      SYSTEM: Bell,
      PAYOUT: CreditCard,
      VERIFICATION: Shield,
      PENALTY: AlertCircle,
      CREDIT_EXPIRY: AlertCircle,
      REFUND: CreditCard,
      default: Bell
    };
    return icons[type] || icons.default;
  };

  const getNotificationColor = (type) => {
    const colors = {
      APPOINTMENT: "bg-blue-100 text-blue-700 border-blue-200",
      REMINDER: "bg-amber-100 text-amber-700 border-amber-200",
      REVIEW: "bg-purple-100 text-purple-700 border-purple-200",
      SYSTEM: "bg-gray-100 text-gray-700 border-gray-200",
      PAYOUT: "bg-green-100 text-green-700 border-green-200",
      VERIFICATION: "bg-teal-100 text-teal-700 border-teal-200",
      PENALTY: "bg-red-100 text-red-700 border-red-200",
      CREDIT_EXPIRY: "bg-orange-100 text-orange-700 border-orange-200",
      REFUND: "bg-indigo-100 text-indigo-700 border-indigo-200",
      default: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[type] || colors.default;
  };

  const getTypeLabel = (type) => {
    const labels = {
      APPOINTMENT: "Appointment",
      REMINDER: "Reminder",
      REVIEW: "Review",
      SYSTEM: "System",
      PAYOUT: "Payout",
      VERIFICATION: "Verification",
      PENALTY: "Penalty",
      CREDIT_EXPIRY: "Credit Expiry",
      REFUND: "Refund"
    };
    return labels[type] || type;
  };

  const notificationTypes = [
    "ALL",
    "APPOINTMENT",
    "REMINDER",
    "REVIEW",
    "PAYOUT",
    "SYSTEM",
    "VERIFICATION",
    "PENALTY"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with your appointments, earnings, and important updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statistics.unread > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={processing === "all"}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              {processing === "all" ? "Marking..." : "Mark All as Read"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDeleteRead}
            disabled={processing === "delete-read"}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {processing === "delete-read" ? "Deleting..." : "Clear Read"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold mt-2">{statistics.total}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold mt-2">{statistics.unread}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Read</p>
                <p className="text-2xl font-bold mt-2">{statistics.read}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last 7 Days</p>
                <p className="text-2xl font-bold mt-2">{statistics.recent}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notifications found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border rounded-md"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {notificationTypes.map(type => (
                  <option key={type} value={type}>
                    {type === "ALL" ? "All Types" : getTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All ({statistics.total})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({statistics.unread})
              </TabsTrigger>
              <TabsTrigger value="read">
                Read ({statistics.read})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                    <p className="text-gray-500">
                      {activeTab === "all" 
                        ? "You don't have any notifications yet."
                        : activeTab === "unread"
                        ? "You're all caught up! No unread notifications."
                        : "No read notifications found."}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                          !notification.isRead 
                            ? "border-l-4 border-l-blue-500 bg-blue-50/50" 
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={getNotificationColor(notification.type).replace("border-", "")}
                                  >
                                    {getTypeLabel(notification.type)}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    disabled={processing === notification.id}
                                  >
                                    {processing === notification.id ? "..." : "Mark as read"}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  disabled={processing === notification.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-600 mt-3">
                              {notification.message}
                            </p>
                            {notification.actionUrl && (
                              <div className="mt-3">
                                <a
                                  href={notification.actionUrl}
                                  className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                                >
                                  View details →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

