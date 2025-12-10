import { useState, useEffect } from 'react';
import type { User } from './types';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RoleSelection } from './pages/RoleSelection';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDashboard } from './pages/PatientDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
  };

  const handleRegister = (registeredUser: User) => {
    setUser(registeredUser);
    localStorage.setItem('currentUser', JSON.stringify(registeredUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsRegistering(false);
    setSelectedRole(null);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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
