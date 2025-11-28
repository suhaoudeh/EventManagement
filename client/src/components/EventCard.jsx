import React from "react";
import '../styles.css';

export default function EventCard({ event }) {
  return (
    <div className="event-card">
      <div style={{ flex: 1 }}>
        <h2 className="event-title">{event.title || "Untitled Event"}</h2>
        <p><strong>Date:</strong> {event.date || "Unknown"}</p>
        <p><strong>Location:</strong> {event.location || "Not specified"}</p>
        <p>{event.description || "No description provided."}</p>
      </div>
      <div style={{ marginLeft: 12 }}>
        <div className="placeholder-img" style={{ width: 160, height: 100 }}>Image</div>
      </div>
    </div>
  );
}
