import type { User } from '../types';
import { Users, Activity, Settings } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  return (
    <DashboardLayout user={user} title="Admin Dashboard" onLogout={onLogout}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<Users className="h-6 w-6 text-gray-400" />} title="Total Users" value="125" />
        <StatCard icon={<Activity className="h-6 w-6 text-gray-400" />} title="Active Sessions" value="42" />
        <StatCard icon={<Settings className="h-6 w-6 text-gray-400" />} title="System Status" value="Operational" />
      </div>
    </DashboardLayout>
  );
}
const StatCard = ({ icon, title, value }: { icon: any, title: string, value: string }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5 flex items-center">
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-lg font-medium text-gray-900">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
);