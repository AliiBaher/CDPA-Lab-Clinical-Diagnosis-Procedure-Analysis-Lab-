import { useState } from 'react';
import type { User, UserRole } from '../App';
import { Lock, Mail, UserCircle, User as UserIcon, Phone, Stethoscope } from 'lucide-react';

interface RegisterProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient' as UserRole,
    specialty: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'doctor' && !formData.specialty) {
      setError('Please specify your specialty');
      return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if email already exists
    if (users.some((u: User) => u.email === formData.email)) {
      setError('Email already registered');
      return;
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: formData.email,
      name: formData.name,
      role: formData.role,
      phone: formData.phone,
      ...(formData.role === 'doctor' && { specialty: formData.specialty }),
    };

    // Save to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    onRegister(newUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#a8d5d5] via-[#b8e5e5] to-[#98c5c5] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#87c5c5] rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-[#87c5c5] rounded-full opacity-30 translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#98d5d5] rounded-full opacity-20 translate-x-1/4"></div>
      
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-[#5dd5d5] mb-6">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-gray-400 mb-2">
              Account Type *
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[#5dd5d5] focus:ring-0 focus:border-[#5dd5d5] text-gray-700"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-gray-400 mb-2">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[#5dd5d5] focus:ring-0 focus:border-[#5dd5d5] text-gray-700"
              placeholder=""
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-400 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[#5dd5d5] focus:ring-0 focus:border-[#5dd5d5] text-gray-700"
              placeholder=""
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-gray-400 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[#5dd5d5] focus:ring-0 focus:border-[#5dd5d5] text-gray-700"
              placeholder=""
            />
          </div>

          {formData.role === 'doctor' && (
            <div>
              <label htmlFor="specialty" className="block text-gray-400 mb-2">
                Specialty *
              </label>
              <input
                id="specialty"
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[#5dd5d5] focus:ring-0 focus:border-[#5dd5d5] text-gray-700"
                placeholder="e.g., Cardiology, Pediatrics"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-gray-400 mb-2">
              Password *
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[#5dd5d5] focus:ring-0 focus:border-[#5dd5d5] text-gray-700"
              placeholder=""
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-400 mb-2">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[#5dd5d5] focus:ring-0 focus:border-[#5dd5d5] text-gray-700"
              placeholder=""
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-16 py-3 bg-gradient-to-r from-[#5dd5d5] to-[#6dd5d5] text-white rounded-full hover:from-[#4dc5c5] hover:to-[#5dc5c5] transition-all shadow-lg"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#5dd5d5] hover:text-[#4dc5c5]"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}