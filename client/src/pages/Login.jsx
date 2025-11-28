import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from "react-router-dom";
import '../styles.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });

      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('token', res.data.token);

      navigate('/home');

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-container page-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <input className="form-input" type="email" placeholder="Email" value={email}
               onChange={(e) => setEmail(e.target.value)} required />

        <input className="form-input" type="password" placeholder="Password" value={password}
               onChange={(e) => setPassword(e.target.value)} required />

        <div style={{ marginTop: 10 }}>
          <button className="button-primary" type="submit">Login</button>
        </div>
      </form>

      {error && <p className="text-error">{error}</p>}
    </div>
  );
}

export default Login;
