
// import React, { useEffect, useState } from 'react';
// import api from '../api';

// const Home = () => {
//   const [events, setEvents] = useState([]);
//   const [user, setUser] = useState(null);

//   // Retrieve user info from localStorage
//   useEffect(() => {
//     try {
//       const storedUser = JSON.parse(localStorage.getItem("user"));
//       setUser(storedUser);
//     } catch (err) {
//       console.error("Failed to parse user:", err);
//     }
//   }, []);

//   // Fetch events
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const res = await api.get('/events');
//         setEvents(res.data);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchEvents();
//   }, []);

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Home Page</h1>
//       {user && user.name ? (
//         <h2>Welcome, {user.name}</h2>
//       ) : (
//         <h2>Welcome Guest</h2>
//       )}

//       <h3>Events List:</h3>
//       {events.length === 0 ? (
//         <p>No events found</p>
//       ) : (
//         <ul>
//           {events.map((event) => (
//             <li key={event._id}>
//               {event.name} - {event.date}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default Home;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
 
const Home = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
 
  // Retrieve logged-in user (preferred) and token from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        // parsed may be { name, email, token } or similar
        const username = parsed.name || parsed.username || parsed.email;
        setUser(username ? { username } : parsed);
      } else {
        // fallback to older key
        const username = localStorage.getItem('username');
        if (username) setUser({ username });
        else setUser(null);
      }
    } catch (err) {
      console.error('Failed to parse stored user:', err);
      setUser(null);
    }
  }, []);

  // Fetch events for the authenticated user only. Re-run when token changes.
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setEvents([]);
          return;
        }
        const res = await api.get('/events/me');
        setEvents(res.data || []);
        setFetchError('');
      } catch (err) {
        console.error(err);
        setEvents([]);
        // show a friendly error to the user
        setFetchError(err.response?.data?.error || err.message || 'Failed to fetch events');
      }
    };

    fetchEvents();
    // subscribe to storage events (optional) to react to login/logout in other tabs
    const onStorage = (e) => {
      if (e.key === 'token') fetchEvents();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [/* rerun when token in localStorage changes — handled via storage event or manual refresh */]);
 
  const navigate = useNavigate();

  const showActionMessage = (msg, type = 'error') => {
    setActionMessage({ text: msg, type });
    // auto-clear after 6 seconds
    setTimeout(() => setActionMessage({ text: '', type: '' }), 6000);
  };
 
  return (
    <div style={{ padding: "20px" }}>
      <h1>Home Page</h1>
      {user && user.username ? (
        <h2>Welcome, {user.username}</h2>
      ) : (
        <h2>Welcome Guest — please log in to see your events</h2>
      )}
 
      <section style={{ marginBottom: 20 }}>
        <h3>Create Event</h3>
        <p>You must be logged in to create events.</p>
        <button onClick={() => {
          // redirect logged-in users to a creation page (if implemented)
          if (user) navigate('/create');
          else navigate('/login');
        }}>
          Create Event
        </button>
      </section>

      {actionMessage.text && (
        <div style={{
          padding: '10px 14px',
          background: actionMessage.type === 'success' ? '#e6ffed' : '#ffe6e6',
          color: actionMessage.type === 'success' ? '#0b6623' : '#9b1c1c',
          border: `1px solid ${actionMessage.type === 'success' ? '#2ecc71' : '#ff4d4d'}`,
          borderRadius: 4,
          marginBottom: 12
        }}>
          {actionMessage.text}
        </div>
      )}
 
      <h3>Your Events:</h3>
      {events.length === 0 ? (
        <>
          {fetchError ? (
            <p style={{ color: 'red' }}>Error loading events: {fetchError}</p>
          ) : (
            <p>No events found for this account.</p>
          )}
        </>
      ) : (
        <ul>
          {events.map((event) => {
            const title = event.title || event.name || 'Untitled Event';
            const rawDate = event.date || event.createdAt || event.created_at;
            const dateStr = rawDate ? new Date(rawDate).toLocaleDateString() : 'No date';
            return (
              <li key={event._id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <strong>{title}</strong> — <span>{dateStr}</span>
                  </div>
                  <div>
                    <button onClick={async () => {
                      // Edit: prompt for new title and date then send PUT
                      const newTitle = window.prompt('New title', title);
                      if (newTitle === null) return; // cancelled
                      const newDate = window.prompt('New date (YYYY-MM-DD or leave empty)', rawDate ? new Date(rawDate).toISOString().slice(0,10) : '');
                      try {
                        const payload = { title: newTitle };
                        if (newDate) payload.date = newDate;
                        const res = await api.put(`/events/${event._id}`, payload);
                        // update local state
                        setEvents((prev) => prev.map(ev => ev._id === event._id ? res.data : ev));
                        showActionMessage('Event updated', 'success');
                      } catch (err) {
                        console.error('Failed to update event', err);
                        showActionMessage(err.response?.data?.error || err.message || 'Failed to update event', 'error');
                      }
                    }}>Edit</button>
                    <button onClick={async () => {
                      const ok = window.confirm('Delete this event? This cannot be undone.');
                      if (!ok) return;
                      try {
                        await api.delete(`/events/${event._id}`);
                        setEvents((prev) => prev.filter(ev => ev._id !== event._id));
                        showActionMessage('Event deleted', 'success');
                      } catch (err) {
                        console.error('Failed to delete event', err);
                        showActionMessage(err.response?.data?.error || err.message || 'Failed to delete event', 'error');
                      }
                    }} style={{ marginLeft: 8 }}>Delete</button>
                  </div>
                </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
 
export default Home;
 