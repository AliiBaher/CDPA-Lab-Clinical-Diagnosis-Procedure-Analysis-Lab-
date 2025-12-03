import React from 'react';
import type { User } from '../types';
import { LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  user: User;
  title: string;
  onLogout: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({ user, title, onLogout, icon, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              {icon && <div className="text-blue-600">{icon}</div>}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                <p className="text-xs text-gray-500 capitalize">
                  {user.specialty || user.role} Account
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 text-sm font-medium hidden sm:block">
                Welcome, {user.name}
              </span>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}