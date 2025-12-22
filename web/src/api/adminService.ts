import axiosClient from './axiosClient';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  createdAt: string;
  specialty?: string;
  isApproved?: boolean;  // For doctors
}

export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
  approvedAppointments: number;
  totalCases: number;
}

export interface AppointmentOverview {
  appointmentId: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  status: string;
  createdAt: string;
}

const adminService = {
  // Get all users
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await axiosClient.get('/api/admin/users');
    return response.data;
  },

  // Get admin statistics
  getStatistics: async (): Promise<AdminStats> => {
    const response = await axiosClient.get('/api/admin/statistics');
    return response.data;
  },

  // Get all appointments overview
  getAppointmentsOverview: async (): Promise<AppointmentOverview[]> => {
    const response = await axiosClient.get('/api/admin/appointments');
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: string, newRole: string): Promise<void> => {
    await axiosClient.put(`/api/admin/users/${userId}/role`, { role: newRole });
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await axiosClient.delete(`/api/admin/users/${userId}`);
  },

  // Toggle user active status
  toggleUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    await axiosClient.put(`/api/admin/users/${userId}/status`, { isActive });
  },

  // Approve or reject doctor registration
  approveDoctor: async (doctorId: string, isApproved: boolean): Promise<void> => {
    await axiosClient.put(`/api/admin/doctors/${doctorId}/approve`, { isApproved });
  },

  // Get all users (alias for getAllUsers)
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await axiosClient.get('/api/admin/users');
    return response.data;
  }
};

export default adminService;
