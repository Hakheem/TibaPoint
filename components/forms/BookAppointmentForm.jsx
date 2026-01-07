"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getAvailableSlotsForDoctor, bookAppointmentWithValidation } from '@/actions/appointments';

const BookAppointmentForm = ({ doctor, currentUser }) => {
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientDescription, setPatientDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  // Check if doctor is defined
  if (!doctor) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Alert variant="destructive">
            <AlertTitle>Doctor Information Missing</AlertTitle>
            <AlertDescription>
              Unable to load doctor information. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setError('');
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const result = await getAvailableSlotsForDoctor(doctor.id, formattedDate);
      
      if (result.success) {
        setAvailableSlots(result.slots || []);
      } else {
        setError(result.error);
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedSlot) {
      setError('Please select a date and time slot');
      return;
    }

    if (patientDescription.trim().length < 10) {
      setError('Please provide a brief description of your symptoms (minimum 10 characters)');
      return;
    }

    if ((currentUser?.credits || 0) < 2) {
      setError('Insufficient credits. You need 2 credits to book a 30-minute appointment.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('doctorId', doctor.id);
      formData.append('availabilitySlotId', selectedSlot.id);
      formData.append('appointmentDate', format(selectedDate, 'yyyy-MM-dd'));
      formData.append('patientDescription', patientDescription);

      const result = await bookAppointmentWithValidation(formData);

      if (result.success) {
        toast.success('Appointment booked successfully!');
        // Redirect to appointment details
        router.push(`/appointments/${result.appointment.id}`);
      } else {
        setError(result.error);
        toast.error(result.error || 'Failed to book appointment');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to book appointment. Please try again.');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Format slot time for display
  const formatSlotTime = (slot) => {
    const [hours, minutes] = slot.startTime.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Get display time for slot
  const getSlotDisplayTime = (slot) => {
    return `${slot.startTime} - ${slot.endTime}`;
  };

  // Calculate minimum selectable date (tomorrow for 12-hour notice)
  const minDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Calculate maximum selectable date (30 days from now)
  const maxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    date.setHours(23, 59, 59, 999);
    return date;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Appointment Details
        </CardTitle>
        <CardDescription>
          Select date and time for your 30-minute consultation with Dr. {doctor.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Date Selection using shadcn Popover + Calendar */}
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Select Date *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  // Disable past dates and dates beyond 30 days
                  return date < minDate() || date > maxDate();
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Select a date to see available 30-minute time slots
          </p>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Select Time Slot *
              </Label>
              {loadingSlots && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading slots...
                </div>
              )}
            </div>
            
            {availableSlots.length === 0 && !loadingSlots ? (
              <div className="text-center py-8 border rounded-lg">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No available 30-minute slots for {format(selectedDate, 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please select another date
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`
                      p-4 border rounded-lg text-left transition-all duration-200
                      hover:border-primary hover:bg-primary/5
                      ${selectedSlot?.id === slot.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-input'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${selectedSlot?.id === slot.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <div className="font-medium">{formatSlotTime(slot)}</div>
                        <div className="text-xs text-muted-foreground">
                          {getSlotDisplayTime(slot)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {selectedSlot && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Selected Time</p>
                    <p className="text-primary font-semibold">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {formatSlotTime(selectedSlot)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      30-minute consultation ({getSlotDisplayTime(selectedSlot)})
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedSlot(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Patient Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Consultation Details *
          </Label>
          <Textarea
            id="description"
            placeholder="Briefly describe your symptoms, medical history, or reason for consultation..."
            value={patientDescription}
            onChange={(e) => setPatientDescription(e.target.value)}
            rows={4}
            required
            minLength={10}
            className="resize-none"
          />
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters. This helps the doctor prepare for your consultation.
            </p>
            <p className={`text-xs ${patientDescription.length < 10 ? 'text-destructive' : 'text-green-600'}`}>
              {patientDescription.length}/10
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          type="button"
          onClick={handleSubmit}
          size="lg"
          className="w-full"
          disabled={loading || !selectedDate || !selectedSlot || patientDescription.length < 10 || (currentUser?.credits || 0) < 2}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Booking...
            </>
          ) : (currentUser?.credits || 0) < 2 ? (
            'Insufficient Credits'
          ) : (
            `Book 30-Minute Consultation (2 credits)`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookAppointmentForm;

