export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  gender?: string;
  birthdate?: string;
  specialty?: string;
  password?: string;
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
