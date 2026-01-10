"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Search,
  Users,
  Send,
  Eye,
  X,
  User,
  Mail,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { 
  getAllNotificationsAdmin,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  sendNotificationToUser,
  sendNotificationToRole
} from "@/actions/notifications";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    unread: 0,
    read: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState(null);
  
  // Send notification modal state
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    targetType: "ROLE", // ROLE or USER
    role: "DOCTOR",
    userId: "",
    type: "SYSTEM",
    title: "",
    message: "",
    actionUrl: ""
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeTab, selectedType, selectedRole, searchQuery]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await getAllNotificationsAdmin();

      if (result.success) {
        setNotifications(result.notifications || []);
        setStatistics(result.statistics || { total: 0, unread: 0, read: 0 });
        toast.success("Notifications loaded successfully");
      } else {
        toast.error("Failed to load notifications");
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
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

    // Filter by role
    if (selectedRole !== "ALL") {
      filtered = filtered.filter(n => n.user?.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.user?.name?.toLowerCase().includes(query) ||
        n.user?.email?.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAllAsRead = async () => {
    try {
      setProcessing("all");
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        toast.success("All notifications marked as read");
        loadNotifications();
      } else {
        toast.error(result.error || "Failed to mark all as read");
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteRead = async () => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        setProcessing("delete-read");
        const result = await deleteReadNotifications();
        if (result.success) {
          loadNotifications();
          resolve("Read notifications cleared successfully");
        } else {
          reject(new Error(result.error || "Failed to delete read notifications"));
        }
      } catch (error) {
        console.error("Failed to delete read notifications:", error);
        reject(new Error("Failed to delete read notifications"));
      } finally {
        setProcessing(null);
      }
    });

    toast.promise(promise, {
      loading: "Deleting read notifications...",
      success: (message) => message,
      error: (error) => error.message
    });
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setProcessing(notificationId);
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        toast.success("Notification marked as read");
        loadNotifications();
      } else {
        toast.error(result.error || "Failed to mark as read");
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast.error("Failed to mark as read");
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteNotification = async (notificationId, notificationTitle) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        setProcessing(notificationId);
        const result = await deleteNotification(notificationId);
        if (result.success) {
          loadNotifications();
          resolve(`"${notificationTitle}" deleted successfully`);
        } else {
          reject(new Error(result.error || "Failed to delete notification"));
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
        reject(new Error("Failed to delete notification"));
      } finally {
        setProcessing(null);
      }
    });

    toast.promise(promise, {
      loading: "Deleting notification...",
      success: (message) => message,
      error: (error) => error.message
    });
  };

  const handleSendNotification = async () => {
    if (!sendForm.title.trim() || !sendForm.message.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        setSending(true);
        let result;

        if (sendForm.targetType === "ROLE") {
          result = await sendNotificationToRole({
            role: sendForm.role,
            type: sendForm.type,
            title: sendForm.title,
            message: sendForm.message,
            actionUrl: sendForm.actionUrl || null
          });
        } else {
          // For sending to specific user
          result = await sendNotificationToUser({
            userId: sendForm.userId,
            type: sendForm.type,
            title: sendForm.title,
            message: sendForm.message,
            actionUrl: sendForm.actionUrl || null
          });
        }

        if (result.success) {
          setShowSendModal(false);
          setSendForm({
            targetType: "ROLE",
            role: "DOCTOR",
            userId: "",
            type: "SYSTEM",
            title: "",
            message: "",
            actionUrl: ""
          });
          loadNotifications();
          resolve(result.message || "Notification sent successfully");
        } else {
          reject(new Error(result.error || "Failed to send notification"));
        }
      } catch (error) {
        console.error("Failed to send notification:", error);
        reject(new Error("Failed to send notification"));
      } finally {
        setSending(false);
      }
    });

    toast.promise(promise, {
      loading: "Sending notification...",
      success: (message) => message,
      error: (error) => error.message
    });
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

  const getRoleColor = (role) => {
    const colors = {
      DOCTOR: "bg-blue-100 text-blue-700",
      PATIENT: "bg-green-100 text-green-700",
      ADMIN: "bg-purple-100 text-purple-700",
      default: "bg-gray-100 text-gray-700"
    };
    return colors[role] || colors.default;
  };

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

  const roles = ["ALL", "DOCTOR", "PATIENT", "ADMIN"];
  const notificationTypes = ["ALL", "APPOINTMENT", "REMINDER", "REVIEW", "PAYOUT", "SYSTEM", "VERIFICATION", "PENALTY", "REFUND"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications Management</h1>
          <p className="text-muted-foreground mt-2">
            View all platform notifications and send announcements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowSendModal(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notifications</p>
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
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Platform Notifications</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notifications found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by user, title, or message..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {notificationTypes.map(type => (
                  <option key={type} value={type}>
                    {type === "ALL" ? "All Types" : getTypeLabel(type)}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === "ALL" ? "All Roles" : role}
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
                        ? "There are no notifications in the system."
                        : activeTab === "unread"
                        ? "All notifications have been read."
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
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge 
                                    variant="outline" 
                                    className={getNotificationColor(notification.type).replace("border-", "")}
                                  >
                                    {getTypeLabel(notification.type)}
                                  </Badge>
                                  {notification.user && (
                                    <Badge 
                                      variant="outline" 
                                      className={getRoleColor(notification.user.role)}
                                    >
                                      <User className="h-3 w-3 mr-1" />
                                      {notification.user.name} ({notification.user.role})
                                    </Badge>
                                  )}
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
                                  onClick={() => handleDeleteNotification(notification.id, notification.title)}
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

      {/* Send Notification Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a notification to users or specific user
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={sendForm.targetType === "ROLE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSendForm({...sendForm, targetType: "ROLE"})}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Role
                </Button>
                <Button
                  type="button"
                  variant={sendForm.targetType === "USER" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSendForm({...sendForm, targetType: "USER"})}
                >
                  <User className="h-4 w-4 mr-2" />
                  Specific User
                </Button>
              </div>
            </div>

            {sendForm.targetType === "ROLE" ? (
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={sendForm.role}
                  onChange={(e) => setSendForm({...sendForm, role: e.target.value})}
                >
                  <option value="DOCTOR">Doctors</option>
                  <option value="PATIENT">Patients</option>
                  <option value="ADMIN">Admins</option>
                  <option value="ALL">All Users</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">User ID</label>
                <Input
                  placeholder="Enter user ID"
                  value={sendForm.userId}
                  onChange={(e) => setSendForm({...sendForm, userId: e.target.value})}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Notification Type</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={sendForm.type}
                onChange={(e) => setSendForm({...sendForm, type: e.target.value})}
              >
                <option value="SYSTEM">System</option>
                <option value="APPOINTMENT">Appointment</option>
                <option value="REMINDER">Reminder</option>
                <option value="PAYOUT">Payout</option>
                <option value="ALERT">Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                placeholder="Notification title"
                value={sendForm.title}
                onChange={(e) => setSendForm({...sendForm, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message *</label>
              <Textarea
                placeholder="Notification message"
                rows={4}
                value={sendForm.message}
                onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Action URL (Optional)</label>
              <Input
                placeholder="https://example.com/action"
                value={sendForm.actionUrl}
                onChange={(e) => setSendForm({...sendForm, actionUrl: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSendModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={sending || !sendForm.title.trim() || !sendForm.message.trim()}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

