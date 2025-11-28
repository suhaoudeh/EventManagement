import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/event_logo.png';

const Navbar = ({ user: propUser, onLogout: propOnLogout }) => {
  const navigate = useNavigate();

  // Determine user: prefer prop, otherwise try localStorage
  let user = propUser;
  if (!user) {
    try {
      const raw = localStorage.getItem('user');
      if (raw) user = JSON.parse(raw);
      else {
        // fallback to older keys
        const name = localStorage.getItem('username') || localStorage.getItem('name');
        const email = localStorage.getItem('email');
        if (name || email) user = { name, email };
      }
    } catch (err) {
      user = null;
    }
  }

  const token = localStorage.getItem('token');

  const handleLogout = () => {
    if (propOnLogout) return propOnLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    navigate('/login');
  };

  const displayName = user?.name || user?.username || user?.email || null;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Event Logo" className="navbar-logo-img" />
      </Link>

      <Link to="/home" className="navbar-link">Home</Link>

      <div className="navbar-spacer" />

      {token || displayName ? (
        <>
          <span className="navbar-welcome">
            Welcome{displayName ? `, ${displayName}` : ''}
          </span>

          <Link to="/my-inviters" className="navbar-link">Event Details</Link>

          <button onClick={handleLogout} className="navbar-btn">Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" className="navbar-link">Login</Link>
          <Link to="/register" className="navbar-link">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
