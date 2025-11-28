import React, { useState, useEffect } from 'react';
import api from '../api';
import { useSearchParams } from 'react-router-dom';

const AddInviters = () => {
  const [form, setForm] = useState({
    eventId: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const eid = searchParams.get('eventId');
    if (eid) setForm(f => ({ ...f, eventId: eid }));
  }, [searchParams]);

  const [inviters, setInviters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  // fetch inviters when eventId is present
  useEffect(() => {
    const eid = form.eventId;
    if (!eid) return;
    let cancelled = false;
    const fetchInviters = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/inviters', { params: { eventId: eid } });
        if (!cancelled) setInviters(res.data || []);
      } catch (err) {
        console.error('Failed to load inviters for event', err);
        if (!cancelled) setError(err.response?.data?.error || err.message || 'Failed to load inviters');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchInviters();
    return () => { cancelled = true; };
  }, [form.eventId]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      // send both guestName/guestEmail and name/email for compatibility
      const payload = {
        eventId: form.eventId,
        guestName: form.name,
        guestEmail: form.email,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      };
      const userId = getStoredUserId();
      if (userId) payload.userId = userId;

      const res = await api.post('/inviters', payload);
      setStatus({ type: 'success', message: 'Inviter saved successfully.' });
      // keep the eventId so the list stays focused on the same event
      setForm({ eventId: form.eventId, name: '', email: '', phone: '', message: '' });
      console.log('inviter saved', res.data);
      // refresh inviters list for this event (best-effort)
      try {
        const listRes = await api.get('/inviters', { params: { eventId: payload.eventId } });
        setInviters(listRes.data || []);
      } catch (e) {
        console.warn('Failed to refresh inviters after submit', e);
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.response?.data?.error || err.message || 'Failed to save inviter' });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Add Inviters</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Event ID (required)</label><br />
          <input name="eventId" value={form.eventId} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Name</label><br />
          <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Email</label><br />
          <input name="email" value={form.email} onChange={handleChange} type="email" required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Phone</label><br />
          <input name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Message</label><br />
          <textarea name="message" value={form.message} onChange={handleChange} style={{ width: '100%' }} />
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit">Add Inviter</button>
        </div>
      </form>

      {status.message && (
        <p style={{ color: status.type === 'error' ? 'red' : 'green' }}>{status.message}</p>
      )}
      <hr style={{ margin: '20px 0' }} />
      <h2>Inviters for event</h2>
      {!form.eventId && <p>Provide an Event ID above to see inviters for that event.</p>}
      {form.eventId && (
        <div>
          {loading ? <p>Loading inviters...</p> : null}
          {error ? <p style={{ color: 'red' }}>{error}</p> : null}
          <ul>
            {inviters.length === 0 && !loading ? <li>No inviters for this event yet.</li> : (
              inviters.map(inv => (
                <li key={inv._id || inv.id} style={{ marginBottom: 8 }}>
                  <strong>{inv.guestName || inv.name}</strong> — {inv.guestEmail || inv.email} {inv.phone ? `— ${inv.phone}` : ''}
                  {inv.message && <div style={{ fontStyle: 'italic' }}>{inv.message}</div>}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AddInviters;
