import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      setLoading(true);
      // POST to /api/auth/register (baseURL handles the /api prefix)
      const res = await api.post('/auth/register', { name: name.trim(), email: email.trim(), password });

      localStorage.setItem('user', JSON.stringify(res.data));
      if (res.data.token) localStorage.setItem('token', res.data.token);

      navigate('/home');
    } catch (err) {
      console.error('Registration error', err?.response || err);
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container page-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <input className="form-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input className="form-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input className="form-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div style={{ marginTop: 10 }}>
          <button className="button-primary" type="submit">Register</button>
        </div>
      </form>
      {error && <p className="text-error">{error}</p>}
    </div>
  );
}

export default Register;
