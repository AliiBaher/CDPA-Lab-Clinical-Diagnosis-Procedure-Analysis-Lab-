import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import type { User } from "../types";


const AppRouter = () => {
  const handleLogin = (user: User) => {
    console.log('User logged in:', user);
  };

  const handleSwitchToRegister = () => {
    console.log('Switch to register');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route 
          path="/login" 
          element={
            <Login 
              onLogin={handleLogin} 
              onSwitchToRegister={handleSwitchToRegister} 
            />
          } 
        />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
