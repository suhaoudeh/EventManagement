
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import homepageImage from '../assets/homepage_event.png';
import '../styles.css';
 
const Home = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  const [invitersByEvent, setInvitersByEvent] = useState({});
  const [openInvitersFor, setOpenInvitersFor] = useState(null);
  const [copiedEventId, setCopiedEventId] = useState(null);
 
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
        // fetch inviters for this user's events and group by eventId
        try {
          const invRes = await api.get('/inviters/me');
          const grouped = (invRes.data || []).reduce((acc, c) => {
            const key = c.eventId || 'unknown';
            if (!acc[key]) acc[key] = [];
            acc[key].push(c);
            return acc;
          }, {});
          setInvitersByEvent(grouped);
        } catch (e) {
          console.warn('Failed to fetch inviters for events', e);
        }
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
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const startEdit = (event) => {
    setEditingId(event._id);
    setEditFormData({
      title: event.title || event.name || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().slice(0,16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0,16) : '',
      address: event.location?.address || '',
      city: event.location?.city || '',
      country: event.location?.country || '',
      capacity: event.capacity || '',
      isPublic: !!event.isPublic,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveEdit = async (id) => {
    try {
      // build payload matching server model
      const payload = {
        title: editFormData.title,
        description: editFormData.description,
        date: editFormData.date ? new Date(editFormData.date).toISOString() : undefined,
        endDate: editFormData.endDate ? new Date(editFormData.endDate).toISOString() : undefined,
        location: {
          address: editFormData.address,
          city: editFormData.city,
          country: editFormData.country,
        },
        capacity: editFormData.capacity ? Number(editFormData.capacity) : undefined,
        isPublic: !!editFormData.isPublic,
      };
      const res = await api.put(`/events/${id}`, payload);
      setEvents(prev => prev.map(ev => ev._id === id ? res.data : ev));
      showActionMessage('Event updated', 'success');
      cancelEdit();
    } catch (err) {
      console.error('Failed to save event', err);
      showActionMessage(err.response?.data?.error || err.message || 'Failed to update event', 'error');
    }
  };
 
  return (
    <div style={{ padding: "20px" }}>
      <h1>Home Page</h1>
      {user && user.username ? (
        <h2>Welcome, {user.username}</h2>
      ) : (
        <h2>Welcome Guest — please log in to see your events</h2>
      )}
 
          <section className="home-hero">
            <div>
              <img src={homepageImage} alt="Events" className="homepage-img" />
            </div>
            <div style={{ marginTop: 12 }}>
              <h3>Create Event</h3>
              <p>You must be logged in to create events.</p>
              <button className="btn btn-primary" onClick={() => {
                // redirect logged-in users to a creation page (if implemented)
                if (user) navigate('/create');
                else navigate('/login');
              }}>
                Create Event
              </button>
            </div>
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
            const inviterCount = (invitersByEvent[event._id] || invitersByEvent[String(event._id)] || []).length;
            return (
              <li key={event._id} style={{ marginBottom: 12, padding: 10, border: '1px solid #eee', borderRadius: 6 }}>
                {editingId === event._id ? (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input name="title" value={editFormData.title} onChange={handleEditChange} placeholder="Title" style={{flex:1}} />
                      <input name="date" type="datetime-local" value={editFormData.date} onChange={handleEditChange} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <textarea name="description" value={editFormData.description} onChange={handleEditChange} placeholder="Description" style={{width:'100%'}} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input name="endDate" type="datetime-local" value={editFormData.endDate} onChange={handleEditChange} />
                      <input name="capacity" type="number" value={editFormData.capacity} onChange={handleEditChange} placeholder="Capacity" />
                      <label style={{display:'flex',alignItems:'center',gap:6}}><input name="isPublic" type="checkbox" checked={!!editFormData.isPublic} onChange={handleEditChange} /> Public</label>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input name="address" value={editFormData.address} onChange={handleEditChange} placeholder="Address" />
                      <input name="city" value={editFormData.city} onChange={handleEditChange} placeholder="City" />
                      <input name="country" value={editFormData.country} onChange={handleEditChange} placeholder="Country" />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(event._id)}>Save</button>
                      <button className="btn btn-sm" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{title}</strong>
                      <span style={{
                        display: 'inline-block',
                        background: '#007bff',
                        color: '#fff',
                        borderRadius: 12,
                        padding: '2px 8px',
                        marginLeft: 8,
                        fontSize: 12
                      }}>{inviterCount}</span>
                      {' '}— <span>{dateStr}</span>
                      <div style={{ color: '#555' }}>{event.description}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
                       <span style={{ marginRight: 8 }}><strong>Event ID:</strong> {event._id}</span>
                        <button className="btn btn-sm" onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(String(event._id));
                            setCopiedEventId(event._id);
                            setTimeout(() => setCopiedEventId(null), 2000);
                          } catch (e) {
                            console.error('Copy failed', e);
                          }
                          }} style={{ marginLeft: 6 }}>Copy ID</button>
                          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/send-invitations?eventId=${event._id}`)} style={{ marginLeft: 8 }}>Send Invitations</button>
                        {copiedEventId === event._id && <span style={{ marginLeft: 8, color: '#2a7' }}>Copied!</span>}
                      </div>
                    </div>
                      <div>
                      <button className="btn btn-sm" onClick={() => startEdit(event)}>Edit</button>
                      <button className="btn btn-sm" onClick={() => setOpenInvitersFor(openInvitersFor === event._id ? null : event._id)} style={{ marginLeft: 8 }}>
                        {openInvitersFor === event._id ? 'Hide Inviters' : 'Show Inviters'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={async () => {
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
                  </div>
                )}
                {openInvitersFor === event._id && (
                  <div style={{ marginTop: 10, padding: 8, background: '#fafafa', borderRadius: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Inviters for this event</strong>
                      <button onClick={() => navigate(`/add-inviters?eventId=${event._id}`)}>Add Inviter</button>
                    </div>
                    <ul style={{ marginTop: 8 }}>
                      {(invitersByEvent[event._id] || []).length === 0 ? (
                        <li>No inviters yet for this event.</li>
                      ) : (
                        (invitersByEvent[event._id] || []).map((inv) => (
                          <li key={inv._id || inv.id} style={{ marginBottom: 6 }}>
                            <strong>{inv.guestName || inv.name}</strong> — {inv.guestEmail || inv.email} {inv.phone ? `— ${inv.phone}` : ''}
                            {inv.message && <div style={{ fontStyle: 'italic' }}>{inv.message}</div>}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
export default Home;
