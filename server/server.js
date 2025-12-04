import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import eventRoutes from './routes/event.routes.js';
import occasionRoutes from './routes/occasion.routes.js';
import confirmationRoutes from './routes/confirmation.routes.js';
import invitersRoutes from './routes/inviters.routes.js';

dotenv.config();
const app = express();

// ------------------------
// Middleware
// ------------------------
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // allow your frontend domain
  credentials: true
}));
app.use(express.json());

// Logger for debugging
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// ------------------------
// Serve static frontend
// ------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../client/dist');

app.use(express.static(clientDistPath));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// ------------------------
// Mount API routes
// ------------------------
function mountApiRoutes() {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/occasions', occasionRoutes);
  app.use('/api/confirmations', confirmationRoutes);
  app.use('/api/inviters', invitersRoutes);
}

// ------------------------
// Server start
// ------------------------
const PORT = process.env.PORT || 3000;

function startServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (bound to 0.0.0.0, public)`);
  });
}

// ------------------------
// MongoDB connection
// ------------------------
async function connectWithRetry(attempt = 1) {
  const MAX_RETRIES = 5;
  const DELAY_MS = 2000;

  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI not set — starting server without MongoDB APIs');
    startServer();
    return;
  }

  try {
    console.log(`Connecting to MongoDB (attempt ${attempt})`);
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
    mountApiRoutes();
    startServer();
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    if (attempt < MAX_RETRIES) {
      console.log(`Retrying MongoDB connection in ${DELAY_MS * attempt}ms...`);
      setTimeout(() => connectWithRetry(attempt + 1), DELAY_MS * attempt);
    } else {
      console.error('Starting server without MongoDB APIs');
      startServer();
    }
  }
}

connectWithRetry();

export default app;
