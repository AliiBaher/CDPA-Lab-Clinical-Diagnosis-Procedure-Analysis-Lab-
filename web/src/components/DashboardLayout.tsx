import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { LogOut, User as UserIcon } from 'lucide-react';
import { ProfileEdit } from './ProfileEdit';

interface DashboardLayoutProps {
  user: User;
  title: string;
  onLogout: () => void;
  onProfileUpdate?: (updatedUser: User) => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({ user, title, onLogout, onProfileUpdate, icon, children }: DashboardLayoutProps) {
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // Sync with parent user prop changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleProfileSave = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setIsProfileEditOpen(false);
    
    // Callback to parent component so it updates its state
    onProfileUpdate?.(updatedUser);
  };

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
                  {currentUser.specialty || currentUser.role} Account
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 text-sm font-medium hidden sm:block">
                Welcome, {currentUser.name}
              </span>
              
              <button
                onClick={() => setIsProfileEditOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-medical-600 hover:bg-medical-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 transition-colors"
                title="Edit Profile"
              >
                <UserIcon className="w-4 h-4" />
              </button>

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

      <ProfileEdit
        user={currentUser}
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        onSave={handleProfileSave}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}