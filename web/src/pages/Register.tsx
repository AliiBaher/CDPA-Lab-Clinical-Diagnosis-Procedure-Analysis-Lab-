import { useState } from 'react';
import type { User, UserRole } from '../types';
import { Input } from '../ui/Input';

interface RegisterProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    phone: '', 
    role: 'patient' as UserRole
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5172/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
        setLoading(false);
        return;
      }

      const data = await response.json();
      const newUser: User = {
        id: data.id,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`.trim(),
        role: data.role as UserRole,
        phone: data.phone,
      };

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(newUser));

      onRegister(newUser);
    } catch (err) {
      setError('Unable to connect. Please check your connection and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-medical-100 via-medical-50 to-medical-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-medical-300 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-medical-300 rounded-full opacity-30 translate-x-1/3 translate-y-1/3"></div>
      
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
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name *" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            <Input label="Last Name *" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>

          <Input label="Email Address *" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Input label="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Password *" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <Input label="Confirm Password *" type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

          <div className="flex justify-center pt-2">
            <button type="submit" disabled={loading} className="px-12 py-2.5 bg-gradient-to-r from-medical-500 to-medical-400 text-white rounded-full hover:shadow-lg hover:from-medical-600 hover:to-medical-500 transition-all text-sm font-medium disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-medical-500 font-semibold hover:text-medical-600 hover:underline">
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}