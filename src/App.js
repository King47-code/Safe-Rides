import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RiderDashboard from './pages/RiderDashboard';
import DriverDashboard from './pages/DriverDashboard';
import Chat from './pages/Chat';

// Protected route wrapper
function PrivateRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  if (!user.role || (role && user.role !== role)) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rider" element={
          <PrivateRoute role="rider">
            <RiderDashboard />
          </PrivateRoute>
        } />
        <Route path="/driver" element={
          <PrivateRoute role="driver">
            <DriverDashboard />
          </PrivateRoute>
        } />
        <Route path="/chat" element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;