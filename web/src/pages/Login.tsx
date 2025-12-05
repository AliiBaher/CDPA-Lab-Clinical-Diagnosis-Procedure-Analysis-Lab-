import { useState } from 'react';
import type { User, UserRole } from '../types';
import { Input } from '../ui/Input';

interface LoginProps {
  onLogin: (user: User, token: string) => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5172/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          setError(errorData.message || 'Invalid email or password. Please try again.');
        } catch {
          setError(`Error: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      const user: User = {
        id: data.id,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`.trim(),
        role: data.role as UserRole,
        phone: data.phone,
      };

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));

      onLogin(user, data.token);
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection failed. Please make sure the API server is running on http://localhost:5172');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-medical-100 via-medical-50 to-medical-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-medical-300 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-medical-300 rounded-full opacity-30 translate-x-1/3 translate-y-1/3"></div>
      
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <h1 className="text-medical-500 mb-6 text-center text-3xl font-bold">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input id="email" label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input id="password" label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div className="flex justify-center pt-4">
            <button type="submit" disabled={loading} className="px-16 py-3 bg-gradient-to-r from-medical-500 to-medical-400 text-white rounded-full hover:shadow-lg hover:from-medical-600 hover:to-medical-500 transition-all disabled:opacity-50">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-medical-500 font-semibold hover:text-medical-600 hover:underline">
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
}