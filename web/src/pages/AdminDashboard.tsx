import { useState, useEffect } from 'react';
import type { User } from '../types';
import { Users, Activity, Calendar, Database, Trash2, Edit, UserCheck, UserX } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import adminService, { type AdminUser, type AdminStats, type AppointmentOverview } from '../api/adminService';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onProfileUpdate?: (updatedUser: User) => void;
}

export function AdminDashboard({ user, onLogout, onProfileUpdate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'appointments'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [appointments, setAppointments] = useState<AppointmentOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'appointments') {
      loadAppointments();
    }
  }, [activeTab]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStatistics();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load statistics:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAppointmentsOverview();
      setAppointments(data);
    } catch (err: any) {
      console.error('Failed to load appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      loadStatistics();
    } catch (err: any) {
      alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateRole = async (userId: string) => {
    if (!newRole) return;
    
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUserId(null);
      setNewRole('');
      loadStatistics();
    } catch (err: any) {
      alert('Failed to update role: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <DashboardLayout user={user} title="Admin Dashboard" onLogout={onLogout} onProfileUpdate={onProfileUpdate}>
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'appointments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Users className="h-8 w-8 text-blue-500" />}
              title="Total Users"
              value={stats?.totalUsers.toString() || '0'}
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={<UserCheck className="h-8 w-8 text-green-500" />}
              title="Total Doctors"
              value={stats?.totalDoctors.toString() || '0'}
              bgColor="bg-green-50"
            />
            <StatCard
              icon={<Activity className="h-8 w-8 text-purple-500" />}
              title="Total Patients"
              value={stats?.totalPatients.toString() || '0'}
              bgColor="bg-purple-50"
            />
            <StatCard
              icon={<Calendar className="h-8 w-8 text-orange-500" />}
              title="Total Appointments"
              value={stats?.totalAppointments.toString() || '0'}
              bgColor="bg-orange-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-lg font-bold text-yellow-600">{stats?.pendingAppointments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="text-lg font-bold text-green-600">{stats?.approvedAppointments || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">MIMIC-III Data</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Cases</span>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <span className="text-lg font-bold text-blue-600">{stats?.totalCases || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow text-white">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-lg font-medium">Operational</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                      {u.specialty && <div className="text-xs text-gray-500">{u.specialty}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === u.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Select...</option>
                            <option value="admin">Admin</option>
                            <option value="doctor">Doctor</option>
                            <option value="patient">Patient</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(u.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(null);
                              setNewRole('');
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.role === 'admin' ? 'bg-red-100 text-red-800' :
                          u.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUserId(u.id);
                            setNewRole(u.role);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Appointments Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <tr key={apt.appointmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {apt.patientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {apt.doctorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(apt.appointmentDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        apt.status === 'approved' ? 'bg-green-100 text-green-800' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(apt.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No appointments found
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </DashboardLayout>
  );
}

const StatCard = ({ icon, title, value, bgColor }: { icon: any; title: string; value: string; bgColor: string }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-6">
      <div className={`${bgColor} rounded-lg p-3 w-fit mb-4`}>
        {icon}
      </div>
      <dt className="text-sm font-medium text-gray-500 mb-1">{title}</dt>
      <dd className="text-2xl font-bold text-gray-900">{value}</dd>
    </div>
  </div>
);