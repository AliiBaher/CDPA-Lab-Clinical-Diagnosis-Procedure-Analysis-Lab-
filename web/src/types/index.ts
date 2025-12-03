export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  specialty?: string;
}

export interface Appointment {
  id: string;
  patientName?: string;
  patientEmail?: string;
  doctorName?: string;
  specialty?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'upcoming' | 'completed';
}