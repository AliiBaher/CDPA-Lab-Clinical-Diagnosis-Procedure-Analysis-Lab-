import { useState, useEffect } from 'react';
import { Stethoscope } from 'lucide-react';
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

interface DoctorsListProps {
  onSelectDoctor: (doctor: AvailableDoctor) => void;
}

export function DoctorsList({ onSelectDoctor }: DoctorsListProps) {
  const [doctors, setDoctors] = useState<AvailableDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

  // Generate individual time slots from availability blocks
  const generateTimeSlots = (availableSlots: AvailableSlot[]): AvailableSlot[] => {
    const slots: AvailableSlot[] = [];

    for (const availability of availableSlots) {
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

  useEffect(() => {
    fetchAvailableDoctors();
  }, []);

  const fetchAvailableDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get('/appointments/available-doctors');
      setDoctors(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load doctors');
      console.error('Error fetching doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique specialties
  const specialties = Array.from(new Set(doctors.map(d => d.specialty)));

  // Filter doctors by specialty if selected
  const filteredDoctors = selectedSpecialty
    ? doctors.filter(d => d.specialty === selectedSpecialty)
    : doctors;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto mb-4"></div>
          Loading available doctors...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Specialty Filter */}
      {specialties.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Specialty</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSpecialty('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSpecialty === ''
                  ? 'bg-medical-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Specialties
            </button>
            {specialties.map(specialty => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSpecialty === specialty
                    ? 'bg-medical-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* No Doctors */}
      {filteredDoctors.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No doctors found</p>
        </div>
      )}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          <div
            key={doctor.doctorId}
            onClick={() => onSelectDoctor(doctor)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden border border-gray-200"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-medical-400 to-medical-600 px-6 py-8 text-white text-center">
              <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-80" />
              <h3 className="text-lg font-semibold">{doctor.name}</h3>
            </div>

            {/* Card Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Specialty */}
              <div className="flex items-center text-gray-600">
                <Stethoscope className="w-4 h-4 mr-2 text-medical-500" />
                <span className="text-sm font-medium">{doctor.specialty}</span>
              </div>

              {/* Available Slots Info */}
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">
                  {generateTimeSlots(doctor.availableSlots).length} slots available
                </p>
              </div>

              {/* Book Button */}
              <button className="w-full bg-medical-500 hover:bg-medical-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                View Available Times
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
