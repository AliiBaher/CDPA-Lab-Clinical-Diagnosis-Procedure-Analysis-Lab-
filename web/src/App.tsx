import { useState, useEffect } from 'react';
import type { User } from './types';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDashboard } from './pages/PatientDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

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
  };

  if (!user) {
    return isRegistering ?
      <Register onRegister={handleRegister} onSwitchToLogin={() => setIsRegistering(false)} /> :
      <Login onLogin={handleLogin} onSwitchToRegister={() => setIsRegistering(true)} />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    case 'doctor':
      return <DoctorDashboard user={user} onLogout={handleLogout} />;
    case 'patient':
      return <PatientDashboard user={user} onLogout={handleLogout} />;
    default:
      return <div>Unknown role</div>;
  }
}

export default App;
