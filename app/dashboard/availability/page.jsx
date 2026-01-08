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
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getDoctorAvailability,
  setAvailability,
  deleteAvailability,
  toggleDoctorAvailability,
  getDoctorProfile,
  bulkSetAvailability,
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

// Generate 30-minute time slots
const generateThirtyMinuteSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    // Add :00 and :30 slots for each hour
    for (let minute of [0, 30]) {
      // Skip 11:30 PM if it goes past 11 PM
      if (hour === 22 && minute === 30) continue;

      const nextHour = minute === 30 ? hour + 1 : hour;
      const nextMinute = minute === 30 ? 0 : 30;

      const displayHour = hour % 12 || 12;
      const period = hour >= 12 ? "PM" : "AM";
      const nextDisplayHour = nextHour % 12 || 12;
      const nextPeriod = nextHour >= 12 ? "PM" : "AM";

      slots.push({
        value: `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`,
        endValue: `${nextHour.toString().padStart(2, "0")}:${nextMinute
          .toString()
          .padStart(2, "0")}`,
        label: `${displayHour}:${minute
          .toString()
          .padStart(2, "0")} ${period} - ${nextDisplayHour}:${nextMinute
          .toString()
          .padStart(2, "0")} ${nextPeriod}`,
        shortLabel: `${displayHour}:${minute
          .toString()
          .padStart(2, "0")} ${period}`,
        hour,
        minute,
      });
    }
  }
  return slots;
};

const TIME_SLOTS = generateThirtyMinuteSlots();

// Form validation schema for bulk editing
const bulkAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0, "Please select a day").max(6, "Invalid day"),
  selectedSlots: z.array(z.string()).min(1, "Select at least one time slot"),
});

export default function AvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [pendingBulkSlots, setPendingBulkSlots] = useState({});

  // Initialize form for single slot editing
  const form = useForm({
    resolver: zodResolver(
      z.object({
        dayOfWeek: z
          .number()
          .min(0, "Please select a day")
          .max(6, "Invalid day"),
        startTime: z.string().min(1, "Time slot is required"),
      })
    ),
    defaultValues: {
      dayOfWeek: 0,
      startTime: "09:00",
    },
  });

  // Initialize form for bulk editing
  const bulkForm = useForm({
    resolver: zodResolver(bulkAvailabilitySchema),
    defaultValues: {
      dayOfWeek: 0,
      selectedSlots: [],
    },
  });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const [availabilityResult, profileResult] = await Promise.allSettled([
        getDoctorAvailability(),
        getDoctorProfile(),
      ]);

      if (
        availabilityResult.status === "fulfilled" &&
        availabilityResult.value.success
      ) {
        setSlots(availabilityResult.value.slots || []);
      }

      if (profileResult.status === "fulfilled" && profileResult.value.success) {
        setIsOnline(profileResult.value.doctor?.isAvailable || false);
      }
    } catch (error) {
      console.error("Error loading availability:", error);
      toast.error("Failed to load availability data");
    } finally {
      setLoading(false);
    }
  };

  // Handle single slot submission
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const [startHour, startMinute] = values.startTime.split(":").map(Number);

      let endHour = startHour;
      let endMinute = startMinute + 30;

      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }

      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;

      const existingSlot = slots.find(
        (slot) =>
          slot.dayOfWeek === values.dayOfWeek &&
          slot.startTime === values.startTime &&
          slot.id !== editingSlot?.id
      );

      if (existingSlot) {
        toast.error("This time slot already exists for this day");
        setSubmitting(false);
        return;
      }

      const result = await setAvailability(
        values.dayOfWeek,
        values.startTime,
        endTime,
        editingSlot?.id
      );

      if (result.success) {
        toast.success(
          editingSlot
            ? "Time slot updated successfully"
            : "Time slot added successfully"
        );
        setIsDialogOpen(false);
        setEditingSlot(null);
        form.reset({
          dayOfWeek: 0,
          startTime: "09:00",
        });
        await loadAvailability();
      } else {
        toast.error(result.error || "Failed to save time slot");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save time slot");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle bulk slot selection
  const handleBulkSlotSelect = (slotValue) => {
    const currentSelected = bulkForm.getValues("selectedSlots") || [];
    const isSelected = currentSelected.includes(slotValue);

    if (isSelected) {
      bulkForm.setValue(
        "selectedSlots",
        currentSelected.filter((s) => s !== slotValue)
      );
    } else {
      bulkForm.setValue("selectedSlots", [...currentSelected, slotValue]);
    }
  };

  // Handle bulk submission
  const handleBulkSubmit = async (values) => {
    try {
      setBulkSubmitting(true);

      // Convert selected slots to proper availability format
      const slotsToAdd = values.selectedSlots.map((startTime) => {
        const [startHour, startMinute] = startTime.split(":").map(Number);
        let endHour = startHour;
        let endMinute = startMinute + 30;

        if (endMinute >= 60) {
          endHour += 1;
          endMinute -= 60;
        }

        const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
          .toString()
          .padStart(2, "0")}`;

        return {
          dayOfWeek: values.dayOfWeek,
          startTime,
          endTime,
        };
      });

      // Check for existing slots
      const existingSlots = slots.filter(
        (slot) => slot.dayOfWeek === values.dayOfWeek
      );

      const conflicts = slotsToAdd.filter((newSlot) =>
        existingSlots.some(
          (existing) => existing.startTime === newSlot.startTime
        )
      );

      if (conflicts.length > 0) {
        toast.error(
          `Some slots already exist for ${DAYS[values.dayOfWeek].name}`
        );
        setBulkSubmitting(false);
        return;
      }

      // Use bulk API or loop through single API
      const result = await bulkSetAvailability(slotsToAdd);

      if (result.success) {
        toast.success(
          `Added ${slotsToAdd.length} time slots to ${
            DAYS[values.dayOfWeek].name
          }`
        );
        setIsBulkDialogOpen(false);
        bulkForm.reset({
          dayOfWeek: 0,
          selectedSlots: [],
        });
        await loadAvailability();
      } else {
        toast.error(result.error || "Failed to save time slots");
      }
    } catch (error) {
      console.error("Error saving bulk availability:", error);
      toast.error("Failed to save time slots");
    } finally {
      setBulkSubmitting(false);
    }
  };

  // Quick add multiple slots for a day
  const handleQuickAddDay = (dayId) => {
    bulkForm.reset({
      dayOfWeek: dayId,
      selectedSlots: [],
    });
    setIsBulkDialogOpen(true);
  };

  const handleDelete = async (slotId) => {
    if (!confirm("Are you sure you want to delete this time slot?")) return;

    try {
      const result = await deleteAvailability(slotId);
      if (result.success) {
        toast.success("Time slot deleted");
        await loadAvailability();
      } else {
        toast.error(result.error || "Failed to delete time slot");
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Failed to delete time slot");
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const result = await toggleDoctorAvailability();
      if (result.success) {
        setIsOnline(result.isAvailable);
        toast.success(
          `You are now ${
            result.isAvailable ? "available" : "unavailable"
          } for appointments`
        );
      } else {
        toast.error(result.error || "Failed to toggle availability");
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("Failed to toggle availability");
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    form.reset({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
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
    return slots
      .filter((slot) => slot.dayOfWeek === dayId)
      .sort((a, b) => {
        const aTime = parseInt(a.startTime.replace(":", ""));
        const bTime = parseInt(b.startTime.replace(":", ""));
        return aTime - bTime;
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Availability Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Set your available hourly slots for appointments
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isOnline}
              onCheckedChange={handleToggleAvailability}
              id="availability-status"
              className="cursor-pointer bg-primary/20 ring-1 ring-primary/30 data-[state=checked]:bg-primary data-[state=checked]:ring-primary [&>span]:bg-primary/50 data-[state=checked]:[&>span]:bg-white [&>span]:transition-all"
            />
            <Label htmlFor="availability-status" className="cursor-pointer">
              {isOnline ? "Available" : "Unavailable"}
            </Label>
          </div>

          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Single Slot
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-107">
                <DialogHeader>
                  <DialogTitle>
                    {editingSlot ? "Edit Time Slot" : "Add Time Slot"}
                  </DialogTitle>
                  <DialogDescription>
                    Select a day and 30-minute time slot when you're available
                    for consultations.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="dayOfWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day of Week</FormLabel>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            disabled={submitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a day" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DAYS.map((day) => (
                                <SelectItem
                                  key={day.id}
                                  value={day.id.toString()}
                                >
                                  {day.name}
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
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Slot (30-minutes)</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={submitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time slot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-75">
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

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={form.handleSubmit(handleSubmit)}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {editingSlot ? "Update" : "Save"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Multiple Slots
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Multiple Time Slots</DialogTitle>
                  <DialogDescription>
                    Select multiple 30-minute time slots for a single day. All
                    selected slots will be saved at once.
                  </DialogDescription>
                </DialogHeader>

                <Form {...bulkForm}>
                  <form
                    onSubmit={bulkForm.handleSubmit(handleBulkSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={bulkForm.control}
                      name="selectedSlots"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <FormLabel>Select Time Slots</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                {(field.value || []).length} slots selected
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2 border rounded-lg">
                              {TIME_SLOTS.map((slot) => {
                                const isSelected = (field.value || []).includes(
                                  slot.value
                                );
                                return (
                                  <Button
                                    key={slot.value}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    className="h-auto py-3 px-2 flex flex-col items-center justify-center"
                                    onClick={() => {
                                      const currentValue = field.value || [];
                                      const newValue = isSelected
                                        ? currentValue.filter(
                                            (v) => v !== slot.value
                                          )
                                        : [...currentValue, slot.value];
                                      field.onChange(newValue);
                                    }}
                                    disabled={bulkSubmitting}
                                  >
                                    <div className="text-xs font-medium">
                                      {slot.shortLabel}
                                    </div>
                                    {isSelected && (
                                      <Check className="h-3 w-3 mt-1" />
                                    )}
                                  </Button>
                                );
                              })}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Select morning slots (6 AM - 12 PM)
                                  const morningSlots = TIME_SLOTS.filter(
                                    (slot) => slot.hour < 12
                                  ).map((slot) => slot.value);
                                  field.onChange(morningSlots);
                                }}
                                disabled={bulkSubmitting}
                              >
                                Select Morning
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Select afternoon slots (12 PM - 5 PM)
                                  const afternoonSlots = TIME_SLOTS.filter(
                                    (slot) => slot.hour >= 12 && slot.hour < 17
                                  ).map((slot) => slot.value);
                                  field.onChange(afternoonSlots);
                                }}
                                disabled={bulkSubmitting}
                              >
                                Select Afternoon
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Select evening slots (5 PM - 10 PM)
                                  const eveningSlots = TIME_SLOTS.filter(
                                    (slot) => slot.hour >= 17
                                  ).map((slot) => slot.value);
                                  field.onChange(eveningSlots);
                                }}
                                disabled={bulkSubmitting}
                              >
                                Select Evening
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange([])}
                                disabled={bulkSubmitting}
                              >
                                Clear All
                              </Button>
                            </div>

                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsBulkDialogOpen(false)}
                        disabled={bulkSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          bulkSubmitting ||
                          bulkForm.watch("selectedSlots")?.length === 0
                        }
                      >
                        {bulkSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save {bulkForm.watch("selectedSlots")?.length ||
                              0}{" "}
                            Slots
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      <div
        className={`p-4 rounded-lg border ${
          isOnline ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-start gap-3">
          {isOnline ? (
            <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 text-red-500 shrink-0" />
          )}
          <div className="flex-1">
            <h3
              className={`font-medium mb-1 ${
                isOnline ? "text-green-800" : "text-red-800"
              }`}
            >
              {isOnline
                ? "You are available for appointments"
                : "You are not available"}
            </h3>
            <p
              className={`text-sm ${
                isOnline ? "text-green-700" : "text-red-700"
              }`}
            >
              {isOnline
                ? "Patients can book appointments during your available time slots."
                : "Patients cannot book new appointments until you become available."}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>
                Your 30-minute availability slots for each day
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                bulkForm.reset({
                  dayOfWeek: 0,
                  selectedSlots: [],
                });
                setIsBulkDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick Add Multiple
            </Button>
          </div>
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
                      <h3 className="font-semibold text-lg">{day.name}</h3>
                      <Badge
                        variant={hasSlots ? "default" : "secondary"}
                        className={
                          hasSlots
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : ""
                        }
                      >
                        {hasSlots
                          ? `${daySlots.length} slot${
                              daySlots.length > 1 ? "s" : ""
                            }`
                          : "Unavailable"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickAddDay(day.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Multiple
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          form.reset({
                            dayOfWeek: day.id,
                            startTime: "09:00",
                          });
                          setEditingSlot(null);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Single
                      </Button>
                    </div>
                  </div>

                  {hasSlots ? (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {formatTime(slot.startTime)} -{" "}
                              {formatTime(slot.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(slot)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(slot.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground mb-2">
                        No availability set for {day.name}
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleQuickAddDay(day.id)}
                        >
                          Add multiple slots for {day.name}
                        </Button>
                        <span className="text-muted-foreground">or</span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            form.reset({
                              dayOfWeek: day.id,
                              startTime: "09:00",
                            });
                            setEditingSlot(null);
                            setIsDialogOpen(true);
                          }}
                        >
                          Add single slot
                        </Button>
                      </div>
                    </div>
                  )}

                  <Separator />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Set Your Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold">Quick Add Multiple</h3>
              <p className="text-sm text-muted-foreground">
                Use "Add Multiple Slots" to select all your available time slots
                for a day at once, then save them all together.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-semibold">Single Slot</h3>
              <p className="text-sm text-muted-foreground">
                Use "Add Single Slot" for adding individual 30-minute slots one
                by one.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold">Bulk Selection</h3>
              <p className="text-sm text-muted-foreground">
                In the multiple slots dialog, select all desired time slots. Use
                "Select Morning/Afternoon/Evening" for quick selection.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">4</span>
              </div>
              <h3 className="font-semibold">One-Time Save</h3>
              <p className="text-sm text-muted-foreground">
                All selected slots for a day are saved together with one click.
                No more waiting between each slot addition.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
