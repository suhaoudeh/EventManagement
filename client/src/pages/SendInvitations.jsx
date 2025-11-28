import React, { useEffect, useState } from 'react';
import api from '../api';
import { useSearchParams } from 'react-router-dom';

const SendInvitations = () => {
  const [searchParams] = useSearchParams();
  const [eventId, setEventId] = useState('');
  const [inviters, setInviters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState({}); // map id -> bool

  useEffect(() => {
    const eid = searchParams.get('eventId');
    if (eid) setEventId(eid);
  }, [searchParams]);

  useEffect(() => {
    if (!eventId) return;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/inviters', { params: { eventId } });
        setInviters(res.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || err.message || 'Failed to load inviters');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [eventId]);

  const handleSend = async (id) => {
    setSending(s => ({ ...s, [id]: true }));
    try {
      await api.put(`/inviters/${id}/send`);
      // update local list status
      setInviters(prev => prev.map(i => i._id === id ? { ...i, status: 'sent' } : i));
    } catch (err) {
      console.error('Failed to send invitation', err);
      alert(err.response?.data?.error || err.message || 'Failed to send invitation');
    } finally {
      setSending(s => ({ ...s, [id]: false }));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Send Invitations</h1>
      <div style={{ marginBottom: 12 }}>
        <label>Event ID:</label>
        <input value={eventId} onChange={(e) => setEventId(e.target.value)} style={{ marginLeft: 8 }} />
      </div>

      {loading && <p>Loading inviters...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && inviters.length === 0 && <p>No inviters found for this event.</p>}

      <ul>
        {inviters.map(inv => (
          <li key={inv._id || inv.id} style={{ marginBottom: 10, padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{inv.guestName || inv.name}</strong>
                <div style={{ color: '#555' }}>{inv.guestEmail || inv.email} {inv.phone ? `— ${inv.phone}` : ''}</div>
                {inv.message && <div style={{ fontStyle: 'italic' }}>{inv.message}</div>}
              </div>
              <div>
                <span style={{ marginRight: 10 }}>{inv.status || 'pending'}</span>
                <button disabled={sending[inv._id]} onClick={() => handleSend(inv._id)}>{sending[inv._id] ? 'Sending...' : 'Send Invitation'}</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SendInvitations;
