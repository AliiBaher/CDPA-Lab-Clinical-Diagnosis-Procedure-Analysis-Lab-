import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  const [isAuthenticated] = useState(() => {
    return !!localStorage.getItem('token')
  })

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>CDPA Dashboard</h1>
        <div className="user-info">
          <span>{user.fullName} ({user.role})</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>
      
      <div className="dashboard-content">
        <h2>Welcome, {user.fullName}!</h2>
        <p>Role: {user.role}</p>
        <p>Email: {user.email}</p>
      </div>
    </div>
  )
}

export default App
