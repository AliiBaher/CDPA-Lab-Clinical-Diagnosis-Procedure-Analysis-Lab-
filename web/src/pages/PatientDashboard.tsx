import { useState } from 'react';
import type { User } from '../App';
import { LogOut, Calendar, FileText, User as UserIcon, Phone } from 'lucide-react';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      doctorName: 'Dr. Smith',
      specialty: 'Cardiology',
      date: '2024-12-05',
      time: '10:00 AM',
      status: 'upcoming'
    },
    {
      id: '2',
      doctorName: 'Dr. Johnson',
      specialty: 'General Practice',
      date: '2024-11-28',
      time: '2:30 PM',
      status: 'completed'
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Patient Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-1" />
                        {user.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </button>
                  <button className="w-full flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <FileText className="w-4 h-4 mr-2" />
                    View Medical Records
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-1">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Appointments
                </h3>
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="border-l-4 border-blue-400 pl-3">
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.doctorName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.specialty}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.date} at {appointment.time}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        appointment.status === 'upcoming'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}