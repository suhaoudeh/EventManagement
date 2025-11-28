import React, { useState } from 'react';
import api from '../api';

const EventCard = ({ event }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [inviters, setInviters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const eventId = event._id || event.id;

  const fetchInviters = async () => {
    if (!eventId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/inviters', { params: { eventId } });
      setInviters(res.data || []);
    } catch (err) {
      console.error('Failed to fetch inviters', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch inviters');
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = async () => {
    const next = !showDetails;
    setShowDetails(next);
    if (next && inviters.length === 0) {
      await fetchInviters();
    }
  };

  const formatDate = (d) => {
    try {
      return d ? new Date(d).toLocaleString() : '';
    } catch (e) {
      return d || '';
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
    >
      <h3>{event.title}</h3>
      {event.description && <p>{event.description}</p>}
      <p>
        <strong>Date:</strong> {formatDate(event.date)}
      </p>
      {event.endDate && (
        <p>
          <strong>End:</strong> {formatDate(event.endDate)}
        </p>
      )}
      <p>
        <strong>Location:</strong> {typeof event.location === 'string' ? event.location : (
          <span>{event.location?.address || ''}{event.location?.city ? `, ${event.location.city}` : ''}{event.location?.country ? `, ${event.location.country}` : ''}</span>
        )}
      </p>
      {event.capacity != null && (
        <p><strong>Capacity:</strong> {event.capacity}</p>
      )}

      <div style={{ marginTop: 8 }}>
        <button onClick={toggleDetails}>{showDetails ? 'Hide Details' : 'Show Details'}</button>
      </div>

      {showDetails && (
        <div style={{ marginTop: 12, padding: 10, background: '#f9f9f9', borderRadius: 6 }}>
          <h4>Inviters</h4>
          {loading && <p>Loading inviters...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && inviters.length === 0 && <p>No inviters for this event.</p>}
          {!loading && inviters.length > 0 && (
            <ul>
              {inviters.map(inv => (
                <li key={inv._id || inv.id} style={{ marginBottom: 6 }}>
                  <strong>{inv.guestName || inv.name}</strong> — {inv.guestEmail || inv.email} {inv.phone ? `— ${inv.phone}` : ''}
                  {inv.message && <div style={{ fontStyle: 'italic' }}>{inv.message}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;
