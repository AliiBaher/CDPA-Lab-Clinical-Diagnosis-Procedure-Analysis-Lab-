import { useState } from 'react';
import type { User } from '../types';
import { Input } from '../ui/Input';
import axiosClient from '../api/axiosClient';
import { Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  gender?: string;
  birthdate?: string;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axiosClient.post<AuthResponse>('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const { token, firstName, lastName, email, role, phone, gender, birthdate, specialty } = response.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('role', role);

      const user: User = {
        id: email,
        name: `${firstName} ${lastName}`,
        email,
        role: role as any,
        phone,
        gender,
        birthdate,
        specialty,
      };

      onLogin(user);
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Connection failed. Please make sure the API server is running on http://localhost:5172');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-medical-100 via-medical-50 to-medical-200 relative overflow-hidden">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <h1 className="text-medical-500 mb-6 text-center text-3xl font-bold">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input id="email" label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          
          <div className="relative">
            <Input 
              id="password" 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required 
            />
            <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              className="absolute right-0 bottom-2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div className="flex justify-center pt-4">
            <button type="submit" disabled={isLoading} className="px-16 py-3 bg-gradient-to-r from-medical-500 to-medical-400 text-white rounded-full hover:shadow-lg hover:from-medical-600 hover:to-medical-500 transition-all disabled:opacity-50">
              {isLoading ? 'Logging in...' : 'Login'}
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
