import { useState, useMemo } from 'react';
import type { User, Appointment } from '../types';
import { Users, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

export function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', patientName: 'John Doe', patientEmail: 'john.doe@example.com', date: '2024-12-02', time: '09:00', status: 'confirmed' },
    { id: '2', patientName: 'Jane Smith', patientEmail: 'jane.smith@example.com', date: '2024-12-02', time: '10:30', status: 'pending' },
  ]);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const stats = useMemo(() => {
    const todayApts = appointments.filter(apt => apt.date === selectedDate);
    return {
      today: todayApts,
      confirmed: todayApts.filter(apt => apt.status === 'confirmed').length,
      pending: todayApts.filter(apt => apt.status === 'pending').length,
      totalPatients: 156
    };
  }, [appointments, selectedDate]);

  const updateStatus = (id: string, status: 'confirmed' | 'cancelled') => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status } : apt));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout user={user} title="Doctor Dashboard" onLogout={onLogout} icon={<Users className="w-8 h-8 text-blue-600" />}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Calendar className="text-gray-400" />} title="Today's Appointments" value={stats.today.length} />
        <StatCard icon={<CheckCircle className="text-green-400" />} title="Confirmed" value={stats.confirmed} />
        <StatCard icon={<Clock className="text-yellow-400" />} title="Pending" value={stats.pending} />
        <StatCard icon={<Users className="text-blue-400" />} title="Total Patients" value={stats.totalPatients} />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <ul className="divide-y divide-gray-200">
          {stats.today.length === 0 ? (
            <li className="px-4 py-6 text-center text-gray-500">No appointments for {selectedDate}</li>
          ) : (
            stats.today.map((apt) => (
              <li key={apt.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {apt.status === 'confirmed' ? <CheckCircle className="w-4 h-4 text-green-500" /> : apt.status === 'pending' ? <Clock className="w-4 h-4 text-yellow-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apt.patientName}</p>
                      <p className="text-xs text-gray-500">{apt.patientEmail}</p>
                    </div>
                    <div className="text-sm text-gray-500">{apt.time}</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(apt.status)}`}>{apt.status}</span>
                  </div>
                  {apt.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button onClick={() => updateStatus(apt.id, 'confirmed')} className="text-green-600 hover:text-green-900 text-sm font-medium">Confirm</button>
                      <button onClick={() => updateStatus(apt.id, 'cancelled')} className="text-red-600 hover:text-red-900 text-sm font-medium">Cancel</button>
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </DashboardLayout>
  );
}
const StatCard = ({ icon, title, value }: { icon: any, title: string, value: number }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
    <div className="flex-shrink-0 h-6 w-6 mr-5">{icon}</div>
    <div>
      <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
      <dd className="text-lg font-medium text-gray-900">{value}</dd>
    </div>
  </div>
);