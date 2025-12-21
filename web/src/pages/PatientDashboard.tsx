import { useState } from 'react';
import type { User } from '../types';
import { Calendar, User as UserIcon, Phone, Stethoscope } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { DoctorsList } from '../components/DoctorsList';
import { DoctorDetail } from '../components/DoctorDetail';
import { MyAppointments } from '../components/MyAppointments';

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

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
  onProfileUpdate?: (updatedUser: User) => void;
}

export function PatientDashboard({ user, onLogout, onProfileUpdate }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'appointments'>('browse');
  const [selectedDoctor, setSelectedDoctor] = useState<AvailableDoctor | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectDoctor = (doctor: AvailableDoctor) => {
    setSelectedDoctor(doctor);
  };

  const handleBackToDoctors = () => {
    setSelectedDoctor(null);
  };

  const handleBookingSuccess = (_bookedSlot: AvailableSlot) => {
    setSelectedDoctor(null);
    setActiveTab('appointments');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout user={user} title="Patient Dashboard" onLogout={onLogout} onProfileUpdate={onProfileUpdate}>
      <div className="space-y-6">
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-medical-50 to-blue-50 rounded-lg border border-medical-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-12 w-12 text-medical-500 bg-medical-100 rounded-full p-2" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                {user.phone && <p className="text-sm text-gray-600 flex items-center mt-1"><Phone className="w-3 h-3 mr-1" /> {user.phone}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 space-x-8">
          <button
            onClick={() => {
              setActiveTab('browse');
              setSelectedDoctor(null);
            }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'browse'
                ? 'border-medical-500 text-medical-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center">
              <Stethoscope className="w-4 h-4 mr-2" />
              Browse Doctors
            </div>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'appointments'
                ? 'border-medical-500 text-medical-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              My Appointments
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'browse' && (
            selectedDoctor ? (
              <DoctorDetail
                doctor={selectedDoctor}
                onBack={handleBackToDoctors}
                onBookingSuccess={handleBookingSuccess}
              />
            ) : (
              <DoctorsList onSelectDoctor={handleSelectDoctor} />
            )
          )}

          {activeTab === 'appointments' && (
            <MyAppointments key={refreshTrigger} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}