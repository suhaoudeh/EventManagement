import express from 'express';
import { getAllConfirmations, addConfirmation, getInvitersForUser, sendInvitation } from '../controllers/confirmation.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public: list inviters (supports ?eventId= and ?userId= for filtering)
router.get('/', getAllConfirmations);

// Protected: list inviters created by logged-in user, optional ?eventId=
router.get('/me', protect, getInvitersForUser);

// Public: create an inviter (guest) entry
router.post('/', addConfirmation);

// Protected: mark an inviter as sent
router.put('/:id/send', protect, sendInvitation);

export default router;
