import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // simple check for presence of token/local user
  const isAuthenticated = () => {
    try {
      const token = localStorage.getItem('token');
      return !!token;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title) return setError('Title is required');

    const payload = {
      title,
      description,
      date: date || undefined,
      endDate: endDate || undefined,
      location: {
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
      },
      capacity: capacity ? Number(capacity) : undefined,
      isPublic,
    };

    try {
      setLoading(true);
      const res = await api.post('/events', payload);
      // on success, redirect to home and show event list (home will refetch)
      navigate('/');
    } catch (err) {
      console.error('Create event error', err);
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 600 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <label>Start Date</label>
        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
        <label>End Date</label>
        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <h4>Location</h4>
        <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
        <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
        <input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />

        <input placeholder="Capacity" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} /> Public event
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</button>
          <button type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default CreateEvent;
