import { useState, useContext } from 'react';
import type { User, UserRole } from '../types';
import { Input } from '../ui/Input';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

interface RegisterProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient' as UserRole,   // admin removed
    specialty: '',
  });

  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password)
      return setError('Fill required fields');

    if (formData.password !== formData.confirmPassword)
      return setError('Passwords do not match');

    if (formData.password.length < 6)
      return setError('Password too short (min 6)');

    if (formData.role === 'doctor' && !formData.specialty)
      return setError('Specialty required');

    try {
      const res = await axiosClient.post<AuthResponse>('/auth/register', {
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        role: formData.role,
        phone: formData.phone,
        specialty: formData.role === 'doctor' ? formData.specialty : null,
      });

      const auth = res.data;

      login(auth.token, auth.role);

      const meRes = await axiosClient.get('/auth/me');
      const data = meRes.data;

      const newUser: User = {
        id: (data.id ?? data.Id)?.toString(),
        name: data.fullName ?? data.FullName ?? auth.fullName,
        email: data.email ?? data.Email ?? auth.email,
        role: (data.role ?? data.Role ?? auth.role) as UserRole,
      };

      localStorage.setItem('currentUser', JSON.stringify(newUser));

      onRegister(newUser);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : 'Registration failed');
      } else {
        setError('Registration failed');
      }
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
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-0 py-1.5 bg-transparent border-0 border-b-2 border-medical-500 focus:ring-0 focus:border-medical-600 text-gray-700 outline-none text-sm"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <Input
            label="Full Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {formData.role === 'doctor' && (
            <Input
              label="Specialty *"
              placeholder="e.g. Cardiology"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Password *"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Input
              label="Confirm Password *"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="px-12 py-2.5 bg-gradient-to-r from-medical-500 to-medical-400 text-white rounded-full hover:shadow-lg hover:from-medical-600 hover:to-medical-500 transition-all text-sm font-medium"
            >
              Create Account
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
