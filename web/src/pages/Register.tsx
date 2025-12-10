import { useState } from 'react';
import type { User } from '../types';
import { Input } from '../ui/Input';
import axiosClient from '../api/axiosClient';

interface RegisterProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient',
    specialty: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosClient.post<AuthResponse>('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        role: formData.role,
        specialty: formData.role === 'doctor' ? formData.specialty : null,
      });

      const { token, firstName, lastName, email, role, phone } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      const user: User = {
        id: email,
        name: `${firstName} ${lastName}`,
        email,
        role: role as any,
        phone,
      };

      onRegister(user);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError('Email already exists or invalid data');
      } else {
        setError('Connection failed. Please make sure the API server is running on http://localhost:5172');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-medical-100 via-medical-50 to-medical-200 relative overflow-hidden">

      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 w-full max-w-2xl relative z-10">
        
        <h1 className="text-medical-500 mb-4 text-center text-2xl font-bold">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-3">


          <div>
            <label className="block text-gray-400 mb-1 text-xs">Account Type</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-0 py-1.5 bg-transparent border-0 border-b-2 border-medical-500 focus:ring-0 focus:border-medical-600 text-gray-700 outline-none text-sm"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name *" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
            <Input label="Last Name *" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
          </div>

          {formData.role === 'doctor' && (
            <div className="w-full">
              <Input label="Specialty *" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} required />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Email Address *" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <Input label="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Password *"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Input
              label="Confirm Password *"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button type="submit" disabled={isLoading} className="px-12 py-2.5 bg-gradient-to-r from-medical-500 to-medical-400 text-white rounded-full hover:shadow-lg hover:from-medical-600 hover:to-medical-500 transition-all text-sm font-medium disabled:opacity-50">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-medical-500 font-semibold hover:text-medical-600 hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>

    </div>
  );
}
