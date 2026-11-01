import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import CheckOut from './pages/CheckOut';
import CheckIn from './pages/CheckIn';
import Logs from './pages/Logs';
import Employees from './pages/Employees';
import Profile from './pages/Profile';
// داخل الـ Routes:


function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Inventory /> : <Navigate to="/login" />} />
        <Route path="/checkout" element={user ? <CheckOut /> : <Navigate to="/login" />} />
        <Route path="/checkin" element={user ? <CheckIn /> : <Navigate to="/login" />} />
        <Route path="/logs" element={user ? <Logs /> : <Navigate to="/login" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/employees" element={user ? <Employees /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}