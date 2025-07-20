import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import '../styles.css';
function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await login(phone, password);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate(res.data.role === 'driver' ? '/driver' : '/rider');
    } catch (err) {
      if (err.response) {
        setError(`Server Error: ${err.response.data.error || 'Login failed'}`);
      } else if (err.request) {
        setError('Connection Error: Unable to reach the server. Check your internet or server.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <p style={{ color: 'red' }}>{error}</p>
    </div>
  );
}

export default Login;
