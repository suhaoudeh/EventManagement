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

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');

      // Mount API routes after successful DB connection
      app.use('/api/auth', authRoutes);
      app.use('/api/users', userRoutes);
      app.use('/api/events', eventRoutes);
      app.use('/api/occasions', occasionRoutes);
      app.use('/api/confirmations', confirmationRoutes);
      app.use('/api/inviters', invitersRoutes);

      startServer();
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.error('Exiting because database connection is required.');
      process.exit(1);
    });
} else {
  console.warn('MONGO_URI not set — starting server without MongoDB (API routes disabled)');
  startServer();
}

export default app;

 