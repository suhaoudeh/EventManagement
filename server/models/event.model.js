// import mongoose from 'mongoose';

// const eventSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: String,
//   date: Date,
//   endDate: Date,
//   // reference to the user who created the event
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   capacity: Number,
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model('Event', eventSchema);
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: Date,
  endDate: Date,
  location: {
    // You can expand this object as needed
    address: String,
    city: String,
    country: String,
  },
  occasion_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Occasion' },
  user_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  image: String,
  capacity: Number,
  isPublic: { type: Boolean, default: true },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Explicitly tell Mongoose to use the "Events" collection
export default mongoose.model('Event', eventSchema, 'Events');
