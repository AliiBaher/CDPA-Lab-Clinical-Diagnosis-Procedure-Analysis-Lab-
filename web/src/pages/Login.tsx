import { useState } from 'react';
import type { User, UserRole } from '../types';
import { Input } from '../ui/Input';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'patient' as UserRole });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.email === formData.email && u.role === formData.role);

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials or role');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-medical-100 via-medical-50 to-medical-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-medical-300 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-medical-300 rounded-full opacity-30 translate-x-1/3 translate-y-1/3"></div>
      
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <h1 className="text-medical-500 mb-6 text-center text-3xl font-bold">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2 text-sm">Account Type</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-medical-500 focus:ring-0 focus:border-medical-600 text-gray-700 outline-none"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Input id="email" label="Username / Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input id="password" label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div className="flex justify-center pt-4">
            <button type="submit" className="px-16 py-3 bg-gradient-to-r from-medical-500 to-medical-400 text-white rounded-full hover:shadow-lg hover:from-medical-600 hover:to-medical-500 transition-all">
              Login
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-medical-500 font-semibold hover:text-medical-600 hover:underline">
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}