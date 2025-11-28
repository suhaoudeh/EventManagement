import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAllEvents, createEvent, updateEvent, deleteEvent, getEventsByUser, getMyEvents, getEventById } from '../controllers/event.controller.js';
//import Events from '../models/event.js';
const router = express.Router();

// Protect all event routes so only authenticated users can access them
router.get('/', protect, getAllEvents);  // GET /api/events
// Get events by user id
router.get('/user/:id', protect, getEventsByUser);
// Get events for the authenticated user
router.get('/me', protect, getMyEvents);
// Get single event by id
router.get('/:id', protect, getEventById);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

export default router;
