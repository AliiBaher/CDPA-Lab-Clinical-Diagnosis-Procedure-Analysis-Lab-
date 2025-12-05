import { useState, useContext } from 'react';
import type { User, UserRole } from '../types';
import { Input } from '../ui/Input';
import axiosClient from '../api//axiosClient';
import { AuthContext } from '../context/AuthContext';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // login request
      const res = await axiosClient.post<AuthResponse>('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const auth = res.data;

      // save token
      login(auth.token, auth.role);

      // fetch user profile
      const meRes = await axiosClient.get('/auth/me');
      const data = meRes.data;

      const currentUser: User = {
        id: (data.id ?? data.Id)?.toString(),
        name: data.fullName ?? data.FullName ?? auth.fullName,
        email: data.email ?? data.Email ?? auth.email,
        role: (data.role ?? data.Role ?? auth.role) as UserRole,
      };

      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      onLogin(currentUser);
    } catch (err) {
      console.error(err);
      setError('Invalid email or password');
    }
  };

  // ✅ THIS PART WAS MISSING — MUST RETURN JSX!!!
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-medical-100 via-medical-50 to-medical-200 relative overflow-hidden">

      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <h1 className="text-medical-500 mb-6 text-center text-3xl font-bold">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-16 py-3 bg-gradient-to-r from-medical-500 to-medical-400 text-white rounded-full hover:shadow-lg hover:from-medical-600 hover:to-medical-500 transition-all"
            >
              Login
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-medical-500 font-semibold hover:text-medical-600 hover:underline"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}
