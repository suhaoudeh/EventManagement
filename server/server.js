import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import eventRoutes from './routes/event.routes.js';
import occasionRoutes from './routes/occasion.routes.js';
import confirmationRoutes from './routes/confirmation.routes.js';
import invitersRoutes from './routes/inviters.routes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:7512', // your frontend URL
  credentials: true
}));
app.use(express.json());

// Basic request logger
app.use((req, res, next) => {
  const headersPreview = Object.entries(req.headers)
    .slice(0, 20)
    .map(([k, v]) => `${k}:${String(v).slice(0, 100)}`)
    .join(' | ');
  console.log(`[REQ] ${req.method} ${req.originalUrl} - Headers: ${headersPreview}`);
  next();
});

// Test root route
app.get('/', (req, res) => res.send('Welcome to the Event Management Server'));

// Routes
app.use('/api/auth', authRoutes);         // /api/auth/login, /api/auth/register
app.use('/api/users', userRoutes);        // user management
app.use('/api/events', eventRoutes);      // events
app.use('/api/occasions', occasionRoutes); // occasions
app.use('/api/confirmations', confirmationRoutes); // confirmations (guest RSVPs)
app.use('/api/inviters', invitersRoutes); // inviters API (POST /api/inviters, GET /api/inviters/me)


// MongoDB connection & server start
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));

export default app;
