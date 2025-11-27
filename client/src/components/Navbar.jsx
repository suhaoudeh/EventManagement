import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    <nav style={{ padding: '12px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Link to="/" style={{ marginRight: '12px', textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>Event Management</Link>
      {/* explicit Home button for quick navigation */}
      <Link to="/home" style={{ marginRight: '12px' }}>Home</Link>
      <div style={{ flex: 1 }} />
      {token || displayName ? (
        <>
          <span>Welcome{displayName ? `, ${displayName}` : ''}</span>
          <Link to="/my-inviters" style={{ marginLeft: 12 }}>Events Details </Link>
          <button onClick={handleLogout} style={{ marginLeft: '12px' }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: '12px' }}>Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
