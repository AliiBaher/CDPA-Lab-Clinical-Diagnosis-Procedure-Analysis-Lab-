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
    const response = await axiosClient.get('/admin/users');
    return response.data;
  },

  // Get admin statistics
  getStatistics: async (): Promise<AdminStats> => {
    const response = await axiosClient.get('/admin/statistics');
    return response.data;
  },

  // Get all appointments overview
  getAppointmentsOverview: async (): Promise<AppointmentOverview[]> => {
    const response = await axiosClient.get('/admin/appointments');
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: string, newRole: string): Promise<void> => {
    await axiosClient.put(`/admin/users/${userId}/role`, { role: newRole });
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await axiosClient.delete(`/admin/users/${userId}`);
  },

  // Toggle user active status
  toggleUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    await axiosClient.put(`/admin/users/${userId}/status`, { isActive });
  }
};

export default adminService;
