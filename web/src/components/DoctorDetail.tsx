import { useState } from 'react';
import { ChevronLeft, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';

interface AvailableSlot {
  availabilityId: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

interface AvailableDoctor {
  doctorId: string;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  hospital?: string;
  bio?: string;
  availableSlots: AvailableSlot[];
}

interface DoctorDetailProps {
  doctor: AvailableDoctor;
  onBack: () => void;
  onBookingSuccess?: (bookedSlot: AvailableSlot) => void;
}

export function DoctorDetail({ doctor, onBack, onBookingSuccess }: DoctorDetailProps) {
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  // Generate individual time slots from availability blocks
  const generateTimeSlots = (availabilities: AvailableSlot[]): AvailableSlot[] => {
    const slots: AvailableSlot[] = [];

    for (const availability of availabilities) {
      const [startHours, startMinutes] = availability.startTime.split(':').map(Number);
      const [endHours, endMinutes] = availability.endTime.split(':').map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      for (let time = startTotalMinutes; time < endTotalMinutes; time += availability.slotDurationMinutes) {
        const slotEndTime = time + availability.slotDurationMinutes;

        // Only create slot if it fits within the availability window
        if (slotEndTime <= endTotalMinutes) {
          const slotStartHours = Math.floor(time / 60);
          const slotStartMins = time % 60;
          const slotEndHours = Math.floor(slotEndTime / 60);
          const slotEndMins = slotEndTime % 60;

          slots.push({
            availabilityId: availability.availabilityId,
            date: availability.date,
            startTime: `${String(slotStartHours).padStart(2, '0')}:${String(slotStartMins).padStart(2, '0')}`,
            endTime: `${String(slotEndHours).padStart(2, '0')}:${String(slotEndMins).padStart(2, '0')}`,
            slotDurationMinutes: availability.slotDurationMinutes,
          });
        }
      }
    }

    return slots;
  };

  const generatedSlots = generateTimeSlots(doctor.availableSlots);

  // Group slots by date
  const slotsByDate = generatedSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    },
    {} as Record<string, AvailableSlot[]>
  );

  const sortedDates = Object.keys(slotsByDate).sort();

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setIsBooking(true);
    setError('');
    setSuccessMessage('');

    try {
      await axiosClient.post('/appointments/book', {
        availabilityId: selectedSlot.availabilityId,
        slotStartTime: selectedSlot.startTime,
        slotEndTime: selectedSlot.endTime,
        slotDate: selectedSlot.date,
        notes: bookingNotes,
      });

      // Remove only the specific booked time slot from the doctor's available slots
      const updatedSlots = doctor.availableSlots.filter(slot =>
        !(slot.availabilityId === selectedSlot.availabilityId && 
          slot.startTime === selectedSlot.startTime &&
          slot.endTime === selectedSlot.endTime &&
          slot.date === selectedSlot.date)
      );
      doctor.availableSlots = updatedSlots;

      setSuccessMessage('Appointment booked successfully!');
      setSelectedSlot(null);
      setBookingNotes('');

      // Reset success message after 3 seconds and refresh
      setTimeout(() => {
        onBookingSuccess?.(selectedSlot);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-medical-600 hover:text-medical-700 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Doctors
        </button>
      </div>

      {/* Doctor Info Card */}
      <div className="bg-gradient-to-r from-medical-50 to-blue-50 rounded-lg border border-medical-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dr. {doctor.name}</h2>
            <p className="text-lg text-gray-600 mt-1">{doctor.specialty}</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Available Time Slots */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-medical-500" />
          Available Time Slots
        </h3>

        {sortedDates.length === 0 ? (
          <div className="text-center py-12 bg-amber-50 rounded-lg border-2 border-amber-200">
            <Calendar className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-amber-900 font-medium mb-2">No available time slots</p>
            <p className="text-sm text-amber-700">This doctor hasn't set their availability yet.</p>
            <p className="text-sm text-amber-700">Please check back later or contact them directly.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-medical-500" />
                  {formatDate(date)}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {slotsByDate[date].map(slot => (
                    <button
                      key={`${slot.availabilityId}-${slot.startTime}-${slot.endTime}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all ${
                        selectedSlot?.startTime === slot.startTime && 
                        selectedSlot?.endTime === slot.endTime &&
                        selectedSlot?.date === slot.date
                          ? 'border-medical-500 bg-medical-50 text-medical-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-medical-300'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                      </div>
                      <div className="text-sm">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {slot.slotDurationMinutes} min
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Section */}
      {selectedSlot ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Confirm Booking</h4>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between py-2 border-b border-blue-200">
              <span className="text-gray-600">Doctor:</span>
              <span className="font-medium">Dr. {doctor.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-blue-200">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(selectedSlot.date)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">
                {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={bookingNotes}
              onChange={e => setBookingNotes(e.target.value)}
              placeholder="Any notes for the doctor? (e.g., symptoms, previous treatments)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-medical-500 focus:border-medical-500 outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Book Button */}
          <button
            onClick={handleBookAppointment}
            disabled={isBooking}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isBooking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Booking...
              </>
            ) : (
              'Confirm Appointment'
            )}
          </button>
        </div>
      ) : doctor.availableSlots.length === 0 ? (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 text-center">
          <p className="text-amber-900 font-medium mb-2">No Available Slots</p>
          <p className="text-sm text-amber-700 mb-4">
            Please select a time slot from the calendar to book an appointment.
          </p>
          <p className="text-xs text-amber-600">
            This doctor hasn't published their availability yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-900 font-medium">Select a time slot to book an appointment</p>
        </div>
      )}
    </div>
  );
}
