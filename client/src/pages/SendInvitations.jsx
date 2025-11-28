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
  const [myEvents, setMyEvents] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [selected, setSelected] = useState({}); // map id -> bool
  const [messageTemplate, setMessageTemplate] = useState('');

  useEffect(() => {
    const eid = searchParams.get('eventId');
    if (eid) setEventId(eid);
  }, [searchParams]);

  // fetch current user's events for quick selection
  useEffect(() => {
    let cancelled = false;
    const fetchMyEvents = async () => {
      try {
        const res = await api.get('/events/me');
        if (!cancelled) setMyEvents(res.data || []);
      } catch (err) {
        console.warn('Failed to load user events', err?.response?.data || err.message || err);
      }
    };
    fetchMyEvents();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!eventId) return;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/inviters', { params: { eventId } });
        setInviters(res.data || []);
        // reset selection and composer when inviters load
        setSelected({});
        setMessageTemplate('');
        // fetch event info (title/date) for display
        try {
          const er = await api.get(`/events/${eventId}`);
          setEventInfo(er.data || null);
        } catch (e) {
          console.warn('Failed to load event info', e?.response?.data || e.message || e);
          setEventInfo(null);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || err.message || 'Failed to load inviters');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [eventId]);

    const toggleSelect = (id) => {
      setSelected(s => ({ ...s, [id]: !s[id] }));
    };

    const selectAll = () => {
      const map = {};
      inviters.forEach(i => { map[i._id] = true; });
      setSelected(map);
    };

    const clearSelection = () => setSelected({});

    const getSelectedIds = () => Object.keys(selected).filter(id => selected[id]);

    const applyMessageToSelected = async () => {
      const ids = getSelectedIds();
      if (ids.length === 0) return alert('No recipients selected');
      if (!messageTemplate) return alert('Message is empty');

      const results = await Promise.allSettled(ids.map(id => api.put(`/inviters/${id}`, { message: messageTemplate })));
      const successes = [];
      const failures = [];
      results.forEach((r, idx) => {
        const id = ids[idx];
        if (r.status === 'fulfilled') successes.push(id);
        else failures.push({ id, reason: r.reason?.response?.data?.error || r.reason?.message || String(r.reason) });
      });

      if (successes.length > 0) setInviters(prev => prev.map(i => successes.includes(i._id) ? { ...i, message: messageTemplate } : i));

      if (failures.length > 0) {
        console.warn('Failed to apply message to some recipients', failures);
        alert(`Applied to ${successes.length}, failed for ${failures.length}. See console.`);
      } else {
        alert(`Message applied to ${successes.length} recipients.`);
      }
    };

    const sendSelected = async () => {
      const ids = getSelectedIds();
      if (ids.length === 0) return alert('No recipients selected');
      if (!window.confirm(`Send invitations to ${ids.length} recipients?`)) return;

      const sendingMap = {};
      ids.forEach(id => sendingMap[id] = true);
      setSending(s => ({ ...s, ...sendingMap }));

      const results = await Promise.allSettled(ids.map(id => api.put(`/inviters/${id}/send`)));
      const successes = [];
      const failures = [];
      results.forEach((r, idx) => {
        const id = ids[idx];
        if (r.status === 'fulfilled') successes.push(id);
        else failures.push({ id, reason: r.reason?.response?.data?.error || r.reason?.message || String(r.reason) });
      });

      if (successes.length > 0) setInviters(prev => prev.map(i => successes.includes(i._id) ? { ...i, status: 'sent' } : i));

      // clear sending flags
      setSending(s => {
        const copy = { ...s };
        ids.forEach(id => delete copy[id]);
        return copy;
      });

      if (failures.length > 0) {
        console.warn('Failed to send to some recipients', failures);
        alert(`Sent to ${successes.length}, failed for ${failures.length}. See console.`);
      } else {
        alert(`Sent to ${successes.length} recipients.`);
      }
    };

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

  // Save message for an inviter
  const handleSaveMessage = async (id, message) => {
    try {
      const res = await api.put(`/inviters/${id}`, { message });
      setInviters(prev => prev.map(i => i._id === id ? { ...i, message: res.data.data.message } : i));
      alert('Message saved');
    } catch (err) {
      console.error('Failed to save message', err);
      alert(err.response?.data?.error || err.message || 'Failed to save message');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Send Invitations{eventInfo ? ` — ${eventInfo.title || eventInfo.name || ''}` : ''}</h1>
      {eventInfo && eventInfo.date && <div style={{ color: '#666', marginBottom: 8 }}>{new Date(eventInfo.date).toLocaleString()}</div>}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <div style={{ minWidth: 300 }}>
          <strong>Your Events</strong>
          {myEvents.length === 0 ? (
            <div style={{ marginTop: 8, color: '#666' }}>No events yet.</div>
          ) : (
            <ul style={{ marginTop: 8 }}>
              {myEvents.map(ev => {
                const idVal = ev._id || ev.id;
                const isSelected = String(idVal) === String(eventId);
                return (
                  <li key={idVal} style={{ marginBottom: 8, padding: 8, borderRadius: 6, background: isSelected ? '#eef9f0' : 'transparent', border: isSelected ? '1px solid #2aa173' : '1px solid transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{ev.title || ev.name || 'Untitled'}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{ev.date ? new Date(ev.date).toLocaleString() : ''}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{idVal}</div>
                      <button className="btn btn-sm" onClick={() => { setEventId(idVal); }}>Use</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <label>Event ID:</label>
          <input value={eventId} onChange={(e) => setEventId(e.target.value)} style={{ marginLeft: 8, width: '60%' }} />
        </div>
      </div>

      {loading && <p>Loading inviters...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && inviters.length === 0 && <p>No inviters found for this event.</p>}

      {/* Composer & batch actions */}
      <div style={{ marginBottom: 12, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong>Invitation Message</strong>
          <div style={{ fontSize: 13, color: '#666' }}>{getSelectedIds().length} selected</div>
        </div>
        <textarea value={messageTemplate} onChange={(e) => setMessageTemplate(e.target.value)} rows={4} style={{ width: '100%', marginBottom: 8 }} placeholder="Write a message to apply to selected invitees (use {{guestName}} to personalize)." />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={applyMessageToSelected} disabled={getSelectedIds().length === 0 || !messageTemplate}>Apply message to selected</button>
          <button className="btn btn-primary" onClick={sendSelected} disabled={getSelectedIds().length === 0}>Send to selected</button>
          <button className="btn btn-sm" onClick={selectAll}>Select all</button>
          <button className="btn btn-sm" onClick={clearSelection}>Clear</button>
        </div>
      </div>

      <ul>
        {inviters.map(inv => (
          <li key={inv._id || inv.id} style={{ marginBottom: 10, padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 28, display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" checked={!!selected[inv._id]} onChange={() => toggleSelect(inv._id)} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{inv.guestName || inv.name}</strong>
                  <span style={{ color: '#555' }}>{inv.status || 'pending'}</span>
                </div>
                <div style={{ color: '#555', marginTop: 6 }}>{inv.guestEmail || inv.email} {inv.phone ? `— ${inv.phone}` : ''}</div>

                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Message (individual)</label>
                  <textarea
                    defaultValue={inv.message || ''}
                    rows={3}
                    style={{ width: '100%', marginTop: 6 }}
                    onBlur={(e) => {
                      const text = e.target.value;
                      if (text !== (inv.message || '')) handleSaveMessage(inv._id, text);
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#777', marginTop: 6 }}>Tip: edit and click away to save the message for this inviter.</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary" disabled={sending[inv._id]} onClick={() => handleSend(inv._id)}>{sending[inv._id] ? 'Sending...' : 'Send Invitation'}</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SendInvitations;
