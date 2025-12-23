import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/Login";
import { ForgotPassword } from "../pages/ForgotPassword";
import { ResetPassword } from "../pages/ResetPassword";
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
