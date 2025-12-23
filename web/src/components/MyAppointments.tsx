import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Trash2, AlertCircle, Star } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import type { User as UserType } from '../types';

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
  notes?: string;
  rating?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

interface MyAppointmentsProps {
  user?: UserType;
}

export function MyAppointments({ user }: MyAppointmentsProps) {
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [ratingAppointmentId, setRatingAppointmentId] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

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

  const handleSubmitRating = async (appointmentId: string) => {
    if (ratingStars === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmittingRating(true);

    try {
      await axiosClient.post('/ratings', {
        appointmentId,
        rating: ratingStars,
        comment: ratingComment || null
      });

      // Update the appointment with the rating
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, rating: { id: '', rating: ratingStars, comment: ratingComment } }
          : apt
      ));

      // Reset rating form
      setRatingAppointmentId(null);
      setRatingStars(0);
      setRatingComment('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
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
    // Convert UTC to local time for display
    const date = new Date(timeStr);
    const hours = date.getHours(); // Local time
    const minutes = date.getMinutes(); // Local time
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHour}:${displayMinutes} ${ampm}`;
  };

  const getAppointmentStatus = (startTimeStr: string, endTimeStr: string) => {
    if (!endTimeStr) return 'past';
    
    const now = new Date();
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);
    
    if (now < startTime) {
      return 'upcoming'; // Appointment hasn't started yet
    } else if (now < endTime) {
      return 'ongoing'; // Currently in the appointment time
    } else {
      return 'past'; // Appointment has ended
    }
  };

  const upcomingAppointments = appointments.filter(apt => {
    const status = getAppointmentStatus(apt.startTime, apt.endTime);
    return status === 'upcoming' || status === 'ongoing';
  });
  const pastAppointments = appointments.filter(apt => getAppointmentStatus(apt.startTime, apt.endTime) === 'past');

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
            {upcomingAppointments.map(apt => {
              const status = getAppointmentStatus(apt.startTime, apt.endTime);
              const isOngoing = status === 'ongoing';
              
              return (
              <div
                key={apt.id}
                className={`border-2 rounded-lg p-6 hover:shadow-md transition-shadow ${
                  isOngoing 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {user?.role === 'doctor' ? apt.patientName : apt.doctorName}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <User className="w-4 h-4 mr-1" />
                      {user?.role === 'doctor' ? 'Patient' : (apt.doctorSpecialty || 'General Practice')}
                    </p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    isOngoing
                      ? 'bg-blue-200 text-blue-900'
                      : 'bg-green-200 text-green-800'
                  }`}>
                    {isOngoing ? 'In Progress' : 'Upcoming'}
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
                  {apt.notes && (
                    <div className={`mt-3 pt-3 border-t ${isOngoing ? 'border-blue-200' : 'border-green-200'}`}>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Notes:</p>
                      <p className="text-sm text-gray-600 italic">{apt.notes}</p>
                    </div>
                  )}
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
              );
            })}
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
                    <h4 className="text-lg font-semibold text-gray-900">
                      {user?.role === 'doctor' ? apt.patientName : apt.doctorName}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <User className="w-4 h-4 mr-1" />
                      {user?.role === 'doctor' ? 'Patient' : (apt.doctorSpecialty || 'General Practice')}
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
                  {apt.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Notes:</p>
                      <p className="text-sm text-gray-500 italic">{apt.notes}</p>
                    </div>
                  )}
                </div>

                {/* Rating Section - Only for patients */}
                {user?.role === 'patient' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {apt.status?.toLowerCase() === 'cancelled' ? (
                      // Show message for cancelled appointments
                      <div className="text-sm text-gray-500 italic">
                        Rating not available for cancelled appointments
                      </div>
                    ) : apt.rating ? (
                      // Show existing rating
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Your Rating:</p>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= apt.rating!.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({apt.rating.rating}/5)</span>
                        </div>
                        {apt.rating.comment && (
                          <p className="text-sm text-gray-600 italic">"{apt.rating.comment}"</p>
                        )}
                      </div>
                    ) : ratingAppointmentId === apt.id ? (
                      // Show rating form
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Rate this appointment:</p>
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingStars(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-6 h-6 cursor-pointer transition-colors ${
                                  star <= ratingStars
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 hover:text-yellow-200'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          placeholder="Share your experience (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSubmitRating(apt.id)}
                            disabled={submittingRating || ratingStars === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingRating ? 'Submitting...' : 'Submit Rating'}
                          </button>
                          <button
                            onClick={() => {
                              setRatingAppointmentId(null);
                              setRatingStars(0);
                              setRatingComment('');
                            }}
                            disabled={submittingRating}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Show rate button
                      <button
                        onClick={() => setRatingAppointmentId(apt.id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <Star className="w-4 h-4" />
                        Rate this appointment
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
