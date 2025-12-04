import express from 'express';
import { getAllConfirmations, addConfirmation, getInvitersForUser, updateConfirmation, sendConfirmation, sendBatch } from '../controllers/confirmation.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public: list inviters (supports ?eventId= and ?userId= for filtering)
router.get('/', getAllConfirmations);

// Protected: list inviters created by logged-in user, optional ?eventId=
router.get('/me', protect, getInvitersForUser);

// Public: create an inviter (guest) entry
router.post('/', addConfirmation);

// Update an inviter (message/status)
router.put('/:id', protect, updateConfirmation);

// Mark an inviter as sent
router.put('/:id/send', protect, sendConfirmation);

// Send multiple invitations in a batch: body { ids: [..] } or { eventId }
router.post('/send-batch', protect, sendBatch);

export default router;
