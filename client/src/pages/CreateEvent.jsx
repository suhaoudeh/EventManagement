import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles.css';

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

  const isAuthenticated = () => {
    try {
      const token = localStorage.getItem('token');
      return !!token;
    } catch (err) {
      return false;
    }
  };

  // FIXED: navigate added to dependency array
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

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
      await api.post('/events', payload); // removed unused "res"
      navigate('/');
    } catch (err) {
      console.error('Create event error', err);
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Create Event</h2>

      <form
        className="form-container"
        onSubmit={handleSubmit}
        style={{ maxWidth: 720, margin: '0 auto' }}
      >
        <div className="form-row">
          <input
            className="form-input"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <textarea
            className="form-textarea"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">Start Date</label>
          <input
            className="form-input"
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">End Date</label>
          <input
            className="form-input"
            type="datetime-local"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <h4>Location</h4>

        <div className="form-row">
          <input
            className="form-input"
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>

        <div className="form-row">
          <input
            className="form-input"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
        </div>

        <div className="form-row">
          <input
            className="form-input"
            placeholder="Country"
            value={country}
            onChange={e => setCountry(e.target.value)}
          />
        </div>

        <div className="form-row">
          <input
            className="form-input"
            placeholder="Capacity"
            type="number"
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
          />
        </div>

        <label className="flex-row" style={{ marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
          />
          <span style={{ marginLeft: 8 }}>Public event</span>
        </label>

        <div className="flex-row">
          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>

          <button
            className="button-secondary"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>

        {error && <p className="text-error">{error}</p>}
      </form>
    </div>
  );
};

export default CreateEvent;
