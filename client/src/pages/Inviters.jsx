import React, { useState } from 'react';
import api from '../api';

const Inviters = () => {
  const [form, setForm] = useState({
    eventId: '',
    guestName: '',
    phone: '',
    guestEmail: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      const payload = {
        eventId: form.eventId,
        guestName: form.guestName,
        phone: form.phone,
        guestEmail: form.guestEmail,
        message: form.message,
      };
      const res = await api.post('/inviters', payload);
      setStatus({ type: 'success', message: 'Inviter saved successfully.' });
      setForm({ eventId: '', guestName: '', phone: '', guestEmail: '', message: '' });
      console.log('confirmation saved', res.data);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.response?.data?.error || err.message || 'Failed to save inviter' });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Inviters</h1>
      <p>Submit inviter / guest information for an event.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Event ID (optional)</label><br />
          <input name="eventId" value={form.eventId} onChange={handleChange} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Guest Name</label><br />
          <input name="guestName" value={form.guestName} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Phone</label><br />
          <input name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Email</label><br />
          <input name="guestEmail" value={form.guestEmail} onChange={handleChange} type="email" required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Message</label><br />
          <textarea name="message" value={form.message} onChange={handleChange} style={{ width: '100%' }} />
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit">Submit</button>
        </div>
      </form>

      {status.message && (
        <p style={{ color: status.type === 'error' ? 'red' : 'green' }}>{status.message}</p>
      )}
    </div>
  );
};

export default Inviters;
