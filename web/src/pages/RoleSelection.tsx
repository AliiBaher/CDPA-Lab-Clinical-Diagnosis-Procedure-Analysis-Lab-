import { User, Stethoscope, ArrowRight } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'patient' | 'doctor') => void;
  onSwitchToLogin: () => void;
}

export function RoleSelection({ onSelectRole, onSwitchToLogin }: RoleSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-medical-100 via-medical-50 to-medical-200 relative overflow-hidden">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative z-10">
        <h1 className="text-medical-500 mb-2 text-center text-4xl font-bold">Join Our Network</h1>
        <p className="text-center text-gray-600 mb-8">Choose your role to get started</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Patient Card */}
          <button
            onClick={() => onSelectRole('patient')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-8 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500 rounded-full">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Patient</h2>
              <p className="text-blue-700 mb-6">
                Book appointments, manage your health records, and connect with doctors
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Doctor Card */}
          <button
            onClick={() => onSelectRole('doctor')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 p-8 hover:border-green-500 hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-500 rounded-full">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">Doctor</h2>
              <p className="text-green-700 mb-6">
                Manage your schedule, patient appointments, and build your medical practice
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-gray-600 mb-2">Already have an account?</p>
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
