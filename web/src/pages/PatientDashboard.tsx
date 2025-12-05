import { useState } from 'react';
import type { User, Appointment } from '../types';
import { Calendar, FileText, User as UserIcon, Phone } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

export function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [appointments] = useState<Appointment[]>([
    { id: '1', doctorName: 'Dr. Smith', specialty: 'Cardiology', date: '2024-12-05', time: '10:00 AM', status: 'upcoming' },
    { id: '2', doctorName: 'Dr. Johnson', specialty: 'General Practice', date: '2024-11-28', time: '2:30 PM', status: 'completed' }
  ]);

  return (
    <DashboardLayout user={user} title="Patient Dashboard" onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-12 w-12 text-gray-300 bg-gray-100 rounded-full p-2" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.phone && <p className="text-sm text-gray-500 flex items-center mt-1"><Phone className="w-3 h-3 mr-1" /> {user.phone}</p>}
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <ActionButton icon={<Calendar className="w-4 h-4 mr-2" />} text="Book Appointment" />
            <ActionButton icon={<FileText className="w-4 h-4 mr-2" />} text="View Medical Records" />
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-6 lg:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Appointments</h3>
          <div className="space-y-4">
            {appointments.slice(0, 3).map((apt) => (
              <div key={apt.id} className="border-l-4 border-medical-400 pl-3">
                <p className="text-sm font-medium text-gray-900">{apt.doctorName}</p>
                <p className="text-xs text-gray-500">{apt.specialty}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-400">{apt.date} at {apt.time}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${apt.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{apt.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
const ActionButton = ({ icon, text }: { icon: any, text: string }) => (
  <button className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">{icon} {text}</button>
);