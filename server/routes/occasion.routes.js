import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAllOccasions, getOccasionNames, createOccasion, deleteOccasion } from '../controllers/occasion.controller.js';

const router = express.Router();

// Get all occasions (protected)
router.get('/', protect, getAllOccasions);
// Get only names array
router.get('/names', protect, getOccasionNames);
// Create a new occasion
router.post('/', protect, createOccasion);
// Delete by id
router.delete('/:id', protect, deleteOccasion);

export default router;
