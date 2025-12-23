import { useState } from 'react';
import type { User } from '../types';
import { DashboardLayout } from '../components/DashboardLayout';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { MyAppointments } from '../components/MyAppointments';
import { DoctorAiAssistPanel } from '../components/DoctorAiAssistPanel';
import { DoctorFeedback } from '../components/DoctorFeedback';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
  onProfileUpdate?: (updatedUser: User) => void;
}

export function DoctorDashboard({ user, onLogout, onProfileUpdate }: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'appointments' | 'availability' | 'ai-assist' | 'feedback'>('availability');
  const token = sessionStorage.getItem('token') || '';

  return (
    <DashboardLayout user={user} title="Doctor Dashboard" onLogout={onLogout} onProfileUpdate={onProfileUpdate}>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex gap-4">
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
              onClick={() => setActiveTab('ai-assist')}
              className={`pb-2 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'ai-assist'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🤖 AI Clinical Assist
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`pb-2 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'feedback'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Patient Feedback
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'availability' ? (
            <AvailabilityCalendar doctorId={user.id} />
          ) : activeTab === 'appointments' ? (
            <MyAppointments user={user} />
          ) : activeTab === 'feedback' ? (
            <DoctorFeedback />
          ) : (
            <DoctorAiAssistPanel token={token} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}