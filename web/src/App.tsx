import { useState, useEffect } from 'react';
import type { User } from './types';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RoleSelection } from './pages/RoleSelection';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDashboard } from './pages/PatientDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { storageUtils } from './utils/sessionManager';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
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
    setIsRegistering(false);
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
    if (isRegistering && selectedRole) {
      return (
        <Register
          selectedRole={selectedRole}
          onRegister={handleRegister}
          onSwitchToLogin={() => {
            setIsRegistering(false);
            setSelectedRole(null);
          }}
          onBackToRoleSelection={() => setSelectedRole(null)}
        />
      );
    }

    if (isRegistering && !selectedRole) {
      return (
        <RoleSelection
          onSelectRole={(role) => setSelectedRole(role)}
          onSwitchToLogin={() => setIsRegistering(false)}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setIsRegistering(true)}
      />
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
