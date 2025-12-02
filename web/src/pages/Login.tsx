import { useState } from 'react';
import type { User, UserRole } from '../App';
import { Lock, Mail, UserCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(
      (u: User) => u.email === email && u.role === role
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials or role');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#a8d5d5] via-[#b8e5e5] to-[#98c5c5] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#87c5c5] rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-[#87c5c5] rounded-full opacity-30 translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#98d5d5] rounded-full opacity-20 translate-x-1/4"></div>
      
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-[#5dd5d5] mb-6">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="role" className="block text-gray-400 mb-2">
              Account Type
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[#5dd5d5] focus:ring-0 focus:border-[#5dd5d5] text-gray-700"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-400 mb-2">
              Username
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[#5dd5d5] focus:ring-0 focus:border-[#5dd5d5] text-gray-700"
              placeholder=""
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-400 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[#5dd5d5] focus:ring-0 focus:border-[#5dd5d5] text-gray-700"
              placeholder=""
            />
            <div className="text-right mt-2">
              <button type="button" className="text-gray-400 hover:text-gray-500">
                forgot password?
              </button>
            </div>
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
              Login
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-[#5dd5d5] hover:text-[#4dc5c5]"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}