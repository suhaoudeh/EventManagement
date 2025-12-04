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

// Path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../client/dist');

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static client (will be used regardless of DB state)
app.use(express.static(clientDistPath));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// MongoDB connection & server start
const PORT = process.env.PORT || 3000;


function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000;

// Basic MONGO_URI validation: ensure it starts with expected scheme
function hasValidMongoScheme(uri) {
  if (!uri || typeof uri !== 'string') return false;
  return /^mongodb(?:\+srv)?:\/\//i.test(uri.trim());
}

function mountApiRoutes() {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/occasions', occasionRoutes);
  app.use('/api/confirmations', confirmationRoutes);
  app.use('/api/inviters', invitersRoutes);
}

async function connectWithRetry(attempt = 1) {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI not set — starting server without MongoDB (API routes disabled)');
    startServer();
    return;
  }

  // quick validation to avoid noisy background errors for malformed URIs
  if (!hasValidMongoScheme(process.env.MONGO_URI)) {
    console.error('MONGO_URI appears malformed or missing the required scheme.');
    console.error('It must start with "mongodb://" or "mongodb+srv://".');
    console.error('Not attempting DB connection. Start server without APIs so frontend remains available.');
    startServer();
    return;
  }

  try {
    console.log(`Attempting MongoDB connection (attempt ${attempt})`);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });

    console.log('MongoDB connected');

    // connection event handlers for runtime visibility
    mongoose.connection.on('error', err => {
      console.error('Mongoose connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected');
    });

    // Mount APIs and start server
    mountApiRoutes();
    startServer();
  } catch (err) {
    console.error(`MongoDB connection attempt ${attempt} failed:`);
    console.error(err && err.message ? err.message : err);

    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    } else {
      console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts.`);
      console.error('Ensure MONGO_URI is correct and the deployment network allows outgoing connections to MongoDB Atlas.');

      // Do not exit the process in production environments where frontend should still be served.
      // Start the server without mounted API routes so the client can still load and show a helpful message.
      startServer();

      // Schedule periodic reconnect attempts in the background.
      const RECONNECT_INTERVAL_MS = 60_000; // try every minute
      console.log(`Scheduling background MongoDB reconnect attempts every ${RECONNECT_INTERVAL_MS}ms.`);
      setInterval(async () => {
        try {
          console.log('Background reconnect: attempting MongoDB connection...');
          await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
          console.log('Background reconnect: MongoDB connected');
          // mount APIs now that DB is available (if not already mounted)
          mountApiRoutes();
        } catch (bgErr) {
          console.warn('Background reconnect failed:', bgErr && bgErr.message ? bgErr.message : bgErr);
        }
      }, RECONNECT_INTERVAL_MS);
    }
  }
}

// start the connect + mount flow
connectWithRetry();

export default app;

