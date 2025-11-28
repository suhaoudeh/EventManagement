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

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const username = parsed.name || parsed.username || parsed.email;
        setUser(username ? { username } : parsed);
      } else {
        const username = localStorage.getItem('username');
        if (username) setUser({ username });
        else setUser(null);
      }
    } catch (err) {
      console.error('Failed to parse stored user:', err);
      setUser(null);
    }
  }, []);

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
        setFetchError(err.response?.data?.error || err.message || 'Failed to fetch events');
      }
    };

    fetchEvents();
    const onStorage = (e) => {
      if (e.key === 'token') fetchEvents();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const navigate = useNavigate();

  const showActionMessage = (msg, type = 'error') => {
    setActionMessage({ text: msg, type });
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
    <div className="page-container">
      <section className="home-hero">
        <h1 className="home-title">Plan. Organize. Manage.</h1>
        <p className="home-subtitle">Your all-in-one platform for seamless event management.</p>
        <p className="home-tagline">Plan and run events with clarity — manage guests, schedules, and logistics in one place.</p>
        <div className="hero-buttons">
          <button className="button-primary" onClick={() => { if (user) navigate('/create'); else navigate('/login'); }}>Get Started</button>
        </div>

       <img 
          src={homepageImage} 
          alt="Event preview" 
          className="homepage-img"
      />
      </section>

      {actionMessage.text && (
        <div className={`action-message ${actionMessage.type === 'success' ? 'action-message-success' : 'action-message-error'}`}>
          {actionMessage.text}
        </div>
      )}

      <section className="section">
        <h3>Create Event</h3>
        <p>You must be logged in to create events.</p>
        <div className="gap-12">
          <button className="button-primary" onClick={() => { if (user) navigate('/create'); else navigate('/login'); }}>Create Event</button>
        </div>
      </section>

      <section className="section">
        <h3>Your Events:</h3>

        {events.length === 0 ? (
          <>
            {fetchError ? (
              <p className="text-error">Error loading events: {fetchError}</p>
            ) : (
              <>
                <p>No events found for this account.</p>
              </>
            )}
          </>
        ) : (
          <ul className="event-list">
            {events.map((event) => {
              const title = event.title || event.name || 'Untitled Event';
              const rawDate = event.date || event.createdAt || event.created_at;
              const dateStr = rawDate ? new Date(rawDate).toLocaleDateString() : 'No date';
              return (
                <li key={event._id} className="event-card">
                  <div className="event-left">
                    <div className="event-card-header">
                      <div>
                        <strong className="event-title">{title}</strong> — <span className="event-meta">{dateStr}</span>
                        <div className="event-description">{event.description}</div>
                      </div>
                      <div className="flex-row">
                        <button className="button-primary" onClick={() => startEdit(event)}>Edit</button>
                        <button className="button-danger" onClick={async () => {
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
                        }}>Delete</button>
                      </div>
                    </div>

                    {editingId === event._id && (
                      <div style={{ marginTop: 10 }}>
                        <div className="edit-row">
                          <input className="edit-input" name="title" value={editFormData.title} onChange={handleEditChange} placeholder="Title" />
                          <input className="edit-input" name="date" type="datetime-local" value={editFormData.date} onChange={handleEditChange} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <textarea className="edit-textarea" name="description" value={editFormData.description} onChange={handleEditChange} placeholder="Description" />
                        </div>
                        <div className="edit-row">
                          <input className="edit-input" name="endDate" type="datetime-local" value={editFormData.endDate} onChange={handleEditChange} />
                          <input className="edit-input" name="capacity" type="number" value={editFormData.capacity} onChange={handleEditChange} placeholder="Capacity" />
                          <label className="flex-row">
                            <input name="isPublic" type="checkbox" checked={!!editFormData.isPublic} onChange={handleEditChange} /> Public
                          </label>
                        </div>
                        <div className="edit-row" style={{ marginBottom: 8 }}>
                          <input className="edit-input" name="address" value={editFormData.address} onChange={handleEditChange} placeholder="Address" />
                          <input className="edit-input" name="city" value={editFormData.city} onChange={handleEditChange} placeholder="City" />
                          <input className="edit-input" name="country" value={editFormData.country} onChange={handleEditChange} placeholder="Country" />
                        </div>
                        <div className="flex-row">
                          <button className="button-primary" onClick={() => saveEdit(event._id)}>Save</button>
                          <button className="button-secondary" onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Home;
