import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

interface Availability {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isBooked: boolean;
  createdAt: string;
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

  // Handle deleting availability
  const handleDeleteAvailability = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability?')) return;

    try {
      await axiosClient.delete(`/availability/${id}`);
      await fetchAvailabilities();
      onUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete availability');
    }
  };

  // Generate individual time slots from availability blocks
  const generateTimeSlots = (availabilityList: Availability[]): Array<Availability & { slotStartTime: string; slotEndTime: string }> => {
    const slots: Array<Availability & { slotStartTime: string; slotEndTime: string }> = [];

    for (const availability of availabilityList) {
      if (availability.isBooked) continue; // Skip booked availability blocks

      const [startHours, startMinutes] = availability.startTime.split(':').map(Number);
      const [endHours, endMinutes] = availability.endTime.split(':').map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      for (let time = startTotalMinutes; time < endTotalMinutes; time += availability.slotDurationMinutes) {
        const slotEndTime = time + availability.slotDurationMinutes;

        if (slotEndTime <= endTotalMinutes) {
          const slotStartHours = Math.floor(time / 60);
          const slotStartMins = time % 60;
          const slotEndHours = Math.floor(slotEndTime / 60);
          const slotEndMins = slotEndTime % 60;

          slots.push({
            ...availability,
            slotStartTime: `${String(slotStartHours).padStart(2, '0')}:${String(slotStartMins).padStart(2, '0')}`,
            slotEndTime: `${String(slotEndHours).padStart(2, '0')}:${String(slotEndMins).padStart(2, '0')}`,
          });
        }
      }
    }

    return slots;
  };

  const generatedSlots = generateTimeSlots(availabilities);
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
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
                    min="15"
                    step="15"
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
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
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
              className={`aspect-square p-2 border rounded-lg cursor-pointer transition-all ${
                day === null ? 'bg-gray-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              } ${day && hasAvailability(day) ? 'bg-blue-50 border-blue-300' : ''} ${day && selectedDay === day ? 'ring-2 ring-blue-500' : ''}`}
            >
              {day && (
                <div className="h-full flex flex-col">
                  <span className="text-sm font-semibold text-gray-700">{day}</span>
                  {hasAvailability(day) && (
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
              <div key={`${slot.id}-${slot.slotStartTime}-${slot.slotEndTime}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {slot.slotStartTime} - {slot.slotEndTime} ({slot.slotDurationMinutes} min)
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAvailability(slot.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete availability"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
