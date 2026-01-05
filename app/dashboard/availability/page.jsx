"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  CalendarClock, 
  Clock, 
  Trash2, 
  Edit2, 
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { 
  getDoctorAvailability, 
  setAvailability, 
  deleteAvailability, 
  toggleDoctorAvailability 
} from "@/actions/doctors";

// Define day names for display
const DAYS = [
  { id: 0, name: "Sunday", short: "Sun" },
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
  { id: 6, name: "Saturday", short: "Sat" },
];

// Time slots options
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute}`,
    label: `${displayHour}:${minute} ${period}`,
  };
});

// Form validation schema
const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
}).refine(
  (data) => {
    const [startHour, startMinute] = data.startTime.split(":").map(Number);
    const [endHour, endMinute] = data.endTime.split(":").map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return endMinutes > startMinutes;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

const AvailabilityPage =()=> {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      dayOfWeek: 0,
      startTime: "09:00",
      endTime: "17:00",
    },
  });

  // Load availability data
  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const result = await getDoctorAvailability();
      if (result.slots) {
        setSlots(result.slots);
      }
    } catch (error) {
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const result = await setAvailability(
        values.dayOfWeek,
        values.startTime,
        values.endTime
      );

      if (result.success) {
        toast.success("Availability saved successfully");
        form.reset();
        setIsDialogOpen(false);
        loadAvailability();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save availability");
    }
  };

  const handleDelete = async (slotId) => {
    try {
      const result = await deleteAvailability(slotId);
      if (result.success) {
        toast.success("Time slot removed");
        loadAvailability();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete slot");
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const result = await toggleDoctorAvailability();
      if (result.success) {
        setIsOnline(!isOnline);
        toast.success(`You are now ${result.isAvailable ? "available" : "unavailable"}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to toggle availability");
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    form.reset({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setIsDialogOpen(true);
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const getSlotsByDay = (dayId) => {
    return slots.filter(slot => slot.dayOfWeek === dayId);
  };

  const resetForm = () => {
    form.reset({
      dayOfWeek: 0,
      startTime: "09:00",
      endTime: "17:00",
    });
    setEditingSlot(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Availability Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Set your available hours for appointments
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isOnline}
              onCheckedChange={handleToggleAvailability}
            />
            <Label className="text-sm font-medium">
              {isOnline ? "Available for Appointments" : "Not Available"}
            </Label>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Time Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingSlot ? "Edit Time Slot" : "Add New Time Slot"}
                </DialogTitle>
                <DialogDescription>
                  Set your available hours for a specific day.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dayOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DAYS.map((day) => (
                              <SelectItem key={day.id} value={day.id.toString()}>
                                {day.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select start time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-48">
                              {TIME_SLOTS.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>
                                  {slot.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select end time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-48">
                              {TIME_SLOTS.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>
                                  {slot.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      {editingSlot ? "Update Slot" : "Save Slot"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Card */}
      <Alert className={isOnline 
        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
        : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      }>
        <div className="flex items-center">
          {isOnline ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
          )}
          <div>
            <AlertTitle className={isOnline 
              ? "text-green-800 dark:text-green-300" 
              : "text-yellow-800 dark:text-yellow-300"
            }>
              {isOnline ? "You are currently available" : "You are currently unavailable"}
            </AlertTitle>
            <AlertDescription className={isOnline 
              ? "text-green-700 dark:text-green-400" 
              : "text-yellow-700 dark:text-yellow-400"
            }>
              {isOnline 
                ? "Patients can book appointments with you during your available hours."
                : "Patients cannot book new appointments until you become available."
              }
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Weekly Schedule Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>
            Your current availability for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {DAYS.map((day) => {
              const daySlots = getSlotsByDay(day.id);
              const hasSlots = daySlots.length > 0;
              
              return (
                <div key={day.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {day.name}
                      </h3>
                      {hasSlots ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        form.reset({
                          dayOfWeek: day.id,
                          startTime: "09:00",
                          endTime: "17:00",
                        });
                        setEditingSlot(null);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Slot
                    </Button>
                  </div>
                  
                  {hasSlots ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(slot)}
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(slot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed rounded-lg text-center">
                      <p className="text-muted-foreground">
                        No availability set for {day.name}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          form.reset({
                            dayOfWeek: day.id,
                            startTime: "09:00",
                            endTime: "17:00",
                          });
                          setEditingSlot(null);
                          setIsDialogOpen(true);
                        }}
                      >
                        Add availability for {day.name}
                      </Button>
                    </div>
                  )}
                  
                  <Separator />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>How to Set Your Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Add Time Slots
              </h3>
              <p className="text-sm text-muted-foreground">
                Click "Add Time Slot" and select the day, start, and end time for your availability.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-semibold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Toggle Availability
              </h3>
              <p className="text-sm text-muted-foreground">
                Use the toggle switch to mark yourself as available or unavailable for appointments.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Manage Slots
              </h3>
              <p className="text-sm text-muted-foreground">
                Edit or delete time slots as needed. Changes take effect immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AvailabilityPage

