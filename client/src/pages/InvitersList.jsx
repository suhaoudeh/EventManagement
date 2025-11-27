import React, { useEffect, useState } from 'react';
import api from '../api';

const InvitersList = () => {
  const [events, setEvents] = useState([]);
  const [confirmations, setConfirmations] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getStoredUserId = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed._id || parsed.id || parsed.userId || null;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const evRes = await api.get('/events/me');
        setEvents(evRes.data || []);
      } catch (err) {
        console.error('Failed to fetch events', err);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchConfirmations = async () => {
      setLoading(true);
      setError('');
      try {
        const userId = getStoredUserId();
        const params = {};
        if (userId) params.userId = userId;
        if (selectedEventId) params.eventId = selectedEventId;

        const token = localStorage.getItem('token');
        let confRes;
        if (token) {
          confRes = await api.get('/inviters/me', { params: selectedEventId ? { eventId: selectedEventId } : {} });
        } else {
          confRes = await api.get('/inviters', { params });
        }
        setConfirmations(confRes.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || err.message || 'Failed to load inviters');
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmations();
  }, [selectedEventId]);

  if (loading) return <div style={{ padding: 20 }}>Loading inviters...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;

  const grouped = confirmations.reduce((acc, c) => {
    const key = c.eventId || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const selectedEvent = selectedEventId ? events.find(e => String(e._id || e.id) === String(selectedEventId)) : null;

  return (
    <div style={{ padding: 20 }}>
      <h1>Inviters For Your Events</h1>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Filter by event:</label>
        <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
          <option value="">All my events</option>
          {events.map((ev) => (
            <option key={ev._id || ev.id} value={ev._id || ev.id}>{ev.title || ev.name || 'Untitled Event'}</option>
          ))}
        </select>
      </div>

      {events.length === 0 && <p>You don't have any events yet.</p>}

      {selectedEvent ? (
        <section style={{ marginBottom: 20 }}>
          <h2>{selectedEvent.title || selectedEvent.name || 'Untitled Event'}</h2>
          {selectedEvent.description && <p style={{ marginTop: 4 }}>{selectedEvent.description}</p>}
          <p style={{ marginTop: 0, color: '#555' }}>{selectedEvent.date ? new Date(selectedEvent.date).toLocaleString() : ''}</p>
          <h3>Inviters</h3>
          <ul>
            {(grouped[selectedEvent._id] || grouped[String(selectedEvent._id)] || []).length === 0 ? (
              <li>No inviters for this event.</li>
            ) : (
              (grouped[selectedEvent._id] || grouped[String(selectedEvent._id)] || []).map((c) => (
                <li key={c._id || c.id} style={{ marginBottom: 6 }}>
                  <strong>{c.guestName}</strong> — {c.guestEmail} {c.phone ? `— ${c.phone}` : ''}
                  {c.message && <div style={{ fontStyle: 'italic' }}>{c.message}</div>}
                </li>
              ))
            )}
          </ul>
        </section>
      ) : (
        events.map((ev) => (
          <section key={ev._id || ev.id} style={{ marginBottom: 20 }}>
            <h2>{ev.title || ev.name || 'Untitled Event'}</h2>
            {ev.description && <p style={{ marginTop: 4 }}>{ev.description}</p>}
            <p style={{ marginTop: 0, color: '#555' }}>{ev.date ? new Date(ev.date).toLocaleString() : ''}</p>
            <ul>
              {(grouped[ev._id] || grouped[String(ev._id)] || []).length === 0 ? (
                <li>No inviters for this event.</li>
              ) : (
                (grouped[ev._id] || grouped[String(ev._id)] || []).map((c) => (
                  <li key={c._id || c.id} style={{ marginBottom: 6 }}>
                    <strong>{c.guestName}</strong> — {c.guestEmail} {c.phone ? `— ${c.phone}` : ''}
                    {c.message && <div style={{ fontStyle: 'italic' }}>{c.message}</div>}
                  </li>
                ))
              )}
            </ul>
          </section>
        ))
      )}

      {events.length > 0 && confirmations.length === 0 && (
        <p>No inviters found for your events.</p>
      )}
    </div>
  );
};

export default InvitersList;
