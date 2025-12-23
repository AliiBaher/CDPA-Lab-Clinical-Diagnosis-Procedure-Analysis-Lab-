import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './types';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RoleSelection } from './pages/RoleSelection';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDashboard } from './pages/PatientDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { storageUtils } from './utils/sessionManager';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);

  useEffect(() => {
    // Load user from sessionStorage (per-tab storage)
    const savedUser = storageUtils.session.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // Store in sessionStorage (per-tab, not shared across tabs)
    storageUtils.session.setUser(loggedInUser);
  };

  const handleRegister = (registeredUser: User) => {
    setUser(registeredUser);
    // Store in sessionStorage (per-tab, not shared across tabs)
    storageUtils.session.setUser(registeredUser);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedRole(null);
    // Clear session storage for this tab only
    storageUtils.session.clear();
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    // Update sessionStorage for this tab
    storageUtils.session.setUser(updatedUser);
  };

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/register/role"
            element={
              <RoleSelection
                onSelectRole={(role) => setSelectedRole(role)}
                onSwitchToLogin={() => {}}
              />
            }
          />
          <Route
            path="/register"
            element={
              selectedRole ? (
                <Register
                  selectedRole={selectedRole}
                  onRegister={handleRegister}
                  onSwitchToLogin={() => {
                    setSelectedRole(null);
                  }}
                  onBackToRoleSelection={() => setSelectedRole(null)}
                />
              ) : (
                <Navigate to="/register/role" />
              )
            }
          />
          <Route
            path="/login"
            element={
              <Login
                onLogin={handleLogin}
                onSwitchToRegister={() => {}}
              />
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard user={user} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
    case 'doctor':
      return <DoctorDashboard user={user} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
    case 'patient':
      return <PatientDashboard user={user} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
    default:
      return <div>Unknown role</div>;
  }
}

export default App;
