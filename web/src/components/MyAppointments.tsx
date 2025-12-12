import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Trash2, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';

interface AppointmentDetail {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  doctorSpecialty?: string;
  patientName: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

export function MyAppointments() {
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get('/appointments/my-appointments');
      setAppointments(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setCancellingId(appointmentId);

    try {
      await axiosClient.delete(`/appointments/${appointmentId}`);
      setAppointments(appointments.filter(apt => apt.id !== appointmentId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr;
    const [hours, minutes] = parts.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUpcoming = (dateStr: string) => {
    const appointmentDate = new Date(dateStr);
    return appointmentDate > new Date();
  };

  const upcomingAppointments = appointments.filter(apt => isUpcoming(apt.startTime));
  const pastAppointments = appointments.filter(apt => !isUpcoming(apt.startTime));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto mb-4"></div>
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* No Appointments */}
      {appointments.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No appointments yet</p>
          <p className="text-sm text-gray-400">Click on a doctor above to book your first appointment</p>
        </div>
      )}

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            {upcomingAppointments.map(apt => (
              <div
                key={apt.id}
                className="bg-green-50 border-2 border-green-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{apt.doctorName}</h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <User className="w-4 h-4 mr-1" />
                      {apt.doctorSpecialty || 'General Practice'}
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                    Upcoming
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-3 text-medical-500" />
                    <span>{formatDate(apt.startTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-3 text-medical-500" />
                    <span>
                      {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCancelAppointment(apt.id)}
                  disabled={cancellingId === apt.id}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {cancellingId === apt.id ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Appointments</h3>
          <div className="space-y-4">
            {pastAppointments.map(apt => (
              <div
                key={apt.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{apt.doctorName}</h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <User className="w-4 h-4 mr-1" />
                      {apt.doctorSpecialty || 'General Practice'}
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{formatDate(apt.startTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                    <span>
                      {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
