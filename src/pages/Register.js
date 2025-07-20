import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
import '../styles.css';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rider');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await register(name, phone, password, role);
      navigate('/login');
    } catch (err) {
      if (err.response) {
        setError(`Server Error: ${err.response.data.error || 'Registration failed'}`);
      } else if (err.request) {
        setError('Connection Error: Unable to reach the server.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="container">
      <header>
        <img src="../ridelogo.jpeg" alt="Safe Ride Logo" className="logo" />
        <h2>Register</h2>
      </header>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="rider">Rider</option>
        <option value="driver">Driver</option>
      </select>
      <button onClick={handleRegister}>Register</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
);
}
