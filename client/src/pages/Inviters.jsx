import React, { useState } from 'react';
import api from '../api';
import '../styles.css';

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
    <div className="page-container">
      <h1>Inviters</h1>
      <p>Submit inviter / guest information for an event.</p>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <label className="form-label">Event ID (optional)</label>
          <input className="form-input" name="eventId" value={form.eventId} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label className="form-label">Guest Name</label>
          <input className="form-input" name="guestName" value={form.guestName} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label className="form-label">Phone</label>
          <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label className="form-label">Email</label>
          <input className="form-input" name="guestEmail" value={form.guestEmail} onChange={handleChange} type="email" required />
        </div>

        <div className="form-row">
          <label className="form-label">Message</label>
          <textarea className="form-textarea" name="message" value={form.message} onChange={handleChange} />
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="button-primary" type="submit">Submit</button>
        </div>
      </form>

      {status.message && (
        <p className={status.type === 'error' ? 'text-error' : ''}>{status.message}</p>
      )}
    </div>
  );
};

export default Inviters;
