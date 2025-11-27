// import mongoose from 'mongoose';

// const confirmationSchema = new mongoose.Schema({
//   eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
//   guestEmail: { type: String, required: true },
//   guestName: { type: String, required: true },
//   status: { type: String, default: 'pending' },
//   numberOfPeople: { type: Number, default: 1 },
//   message: String,
//   confirmedAt: Date
// }, { timestamps: true });

// export default mongoose.model('ConfirmationGuest', confirmationSchema, 'Confirmation–guests');

import mongoose from 'mongoose';

const confirmationSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  userId: { type: String },
  guestEmail: { type: String, required: true },
  guestName: { type: String, required: true },
  phone: { type: String },
  status: { type: String, enum: ['confirmed', 'pending', 'declined'], default: 'pending' },
  numberOfPeople: { type: Number, default: 1 },
  message: { type: String },
  confirmedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'Confirmation–guests' // 👈 EXACT name from your MongoDB
});

export default mongoose.model('ConfirmationGuest', confirmationSchema);
