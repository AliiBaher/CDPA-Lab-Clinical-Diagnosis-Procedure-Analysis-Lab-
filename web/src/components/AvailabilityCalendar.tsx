import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

interface Availability {
  id: string;
  availabilityId: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isBooked: boolean;
}

interface AvailabilityCalendarProps {
  doctorId: string;
  onUpdate?: () => void;
}

export function AvailabilityCalendar({ onUpdate }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 30,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const requestInFlightRef = useRef(false);

  // Helper to format time - just display as-is without timezone conversion
  const formatTime = (timeStr: string) => {
    // Handle both "HH:mm" and "HH:mm:ss" formats
    const timePart = timeStr.split(':').slice(0, 2).join(':'); // Take only HH:mm
    const [hours, minutes] = timePart.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHour}:${displayMinutes} ${ampm}`;
  };

  // Fetch availabilities for current month
  const fetchAvailabilities = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      
      const response = await axiosClient.get<Availability[]>('/availability/my-schedule', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });
      
      // Deduplicate availabilities by ID to prevent duplicates
      const uniqueAvailabilities = Array.from(
        new Map(response.data.map(item => [item.id, item])).values()
      );
      setAvailabilities(uniqueAvailabilities);
    } catch (err: any) {
      console.error('Failed to fetch availabilities:', err);
    }
  };

  // Load availabilities on mount and when currentDate changes
  useEffect(() => {
    fetchAvailabilities();
  }, [currentDate]);

  // Handle adding new availability
  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (requestInFlightRef.current) {
      return;
    }
    
    setError('');
    
    // Check if the slot time has already passed for today
    const slotDate = new Date(formData.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDate = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
    
    if (selectedDate.getTime() === today.getTime()) {
      // For today, check if the end time has passed
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      const slotEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes);
      
      if (slotEndTime <= now) {
        setError('Cannot create availability slots for times that have already passed.');
        return;
      }
    }
    
    setIsLoading(true);
    requestInFlightRef.current = true;

    try {
      await axiosClient.post('/availability', {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotDurationMinutes: formData.slotDurationMinutes,
      });

      setShowAddForm(false);
      setSelectedDay(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      });
      
      await fetchAvailabilities();
      onUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add availability');
    } finally {
      setIsLoading(false);
      requestInFlightRef.current = false;
    }
  };

  // Handle deleting individual slot
  const handleDeleteSlot = async (slotId: string, isBooked: boolean) => {
    if (isBooked) {
      setError('Cannot delete a booked time slot. Patient has already reserved this time.');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    try {
      await axiosClient.delete(`/availability/slot/${slotId}`);
      await fetchAvailabilities();
      onUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  // Handle deleting availability (same as handleDeleteSlot for compatibility)
  const handleDeleteAvailability = (slotId: string, isBooked: boolean) => handleDeleteSlot(slotId, isBooked);

  // Filter out slots that have already started or passed
  const isSlotPassed = (slot: Availability) => {
    const slotDate = new Date(slot.date);
    const now = new Date();
    
    // Parse the start time - hide slots that have already started
    const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
    const slotStartDateTime = new Date(
      slotDate.getFullYear(),
      slotDate.getMonth(),
      slotDate.getDate(),
      startHours,
      startMinutes
    );
    
    return slotStartDateTime <= now;
  };

  // No need to generate slots - API returns individual slots directly, but filter out past and booked ones
  const generatedSlots = availabilities.filter(slot => !isSlotPassed(slot) && !slot.isBooked);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // Adjust to start week on Monday (0 = Monday, 6 = Sunday)
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (day: number) => {
    // Don't allow selection of past dates
    if (isPastDate(day)) return;
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setFormData({
      ...formData,
      date: dateStr,
    });
    setSelectedDay(day);
    setShowAddForm(true);
  };

  const getDateAvailabilities = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return availabilities.filter(a => a.date === dateStr);
  };

  const hasAvailability = (day: number) => {
    return getDateAvailabilities(day).length > 0;
  };

  const isPastDate = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Availability Calendar</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleAddAvailability} className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add Availability - {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (min)</label>
                  <input
                    type="number"
                    value={formData.slotDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, slotDurationMinutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="5"
                    step="5"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Adding...' : 'Add Availability'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setSelectedDay(null); }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Calendar Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => day && handleDayClick(day)}
              className={`aspect-square p-2 border rounded-lg transition-all ${
                day === null ? 'bg-gray-50' : isPastDate(day) ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
              } ${day && !isPastDate(day) && hasAvailability(day) ? 'bg-blue-50 border-blue-300' : ''} ${day && selectedDay === day ? 'ring-2 ring-blue-500' : ''}`}
            >
              {day && (
                <div className="h-full flex flex-col">
                  <span className={`text-sm font-semibold ${isPastDate(day) ? 'text-gray-500' : 'text-gray-700'}`}>{day}</span>
                  {!isPastDate(day) && hasAvailability(day) && (
                    <div className="mt-1 text-xs text-blue-600 font-medium">
                      {getDateAvailabilities(day).length} slot(s)
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Availabilities List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Available Slots</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {generatedSlots.length === 0 ? (
            <p className="text-gray-500 text-sm">No available slots for this month</p>
          ) : (
            generatedSlots.map((slot) => (
              <div key={`${slot.id}-${slot.startTime}-${slot.endTime}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-700 font-medium mt-1">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Duration: {slot.slotDurationMinutes} min
                  </p>
                </div>
                {slot.isBooked ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Booked
                  </span>
                ) : (
                  <button
                    onClick={() => handleDeleteAvailability(slot.id, slot.isBooked)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete availability"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}