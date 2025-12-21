import { useState } from 'react';
import type { User } from '../types';
import { DashboardLayout } from '../components/DashboardLayout';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { MyAppointments } from '../components/MyAppointments';
import { DoctorCases } from '../components/DoctorCases';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
  onProfileUpdate?: (updatedUser: User) => void;
}

export function DoctorDashboard({ user, onLogout, onProfileUpdate }: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'cases' | 'appointments' | 'availability'>('cases');

  return (
    <DashboardLayout user={user} title="Doctor Dashboard" onLogout={onLogout} onProfileUpdate={onProfileUpdate}>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('cases')}
              className={`pb-2 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'cases'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Cases & Clinical Data
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`pb-2 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'appointments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`pb-2 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'availability'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Availability
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'cases' ? (
            <DoctorCases />
          ) : activeTab === 'appointments' ? (
            <MyAppointments />
          ) : (
            <AvailabilityCalendar doctorId={user.id} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}