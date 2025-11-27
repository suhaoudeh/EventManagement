import React from "react";

export default function EventCard({ event }) {
  return (
    <div
      style={{
        padding: "15px",
        border: "1px solid #ccc",
        marginBottom: "10px",
        borderRadius: "6px",
        background: "#f9f9f9"
      }}
    >
      <h2>{event.title || "Untitled Event"}</h2>
      <p><strong>Date:</strong> {event.date || "Unknown"}</p>
      <p><strong>Location:</strong> {event.location || "Not specified"}</p>
      <p>{event.description || "No description provided."}</p>
    </div>
  );
}
