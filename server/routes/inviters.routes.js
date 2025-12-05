import express from 'express';
import { getAllConfirmations, addConfirmation, updateConfirmation, sendConfirmation } from '../controllers/confirmation.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public: list inviters (supports ?eventId= and ?userId= for filtering)
router.get('/', getAllConfirmations);

// Protected: list inviters created by logged-in user, optional ?eventId=
router.get('/me', protect, (req, res, next) => {
	try {
		req.query = req.query || {};
		const uid = req.user?.id || req.user?._id;
		if (uid) req.query.userId = uid;
		return getAllConfirmations(req, res, next);
	} catch (err) {
		next(err);
	}
});

// Public: create an inviter (guest) entry
router.post('/', addConfirmation);

// Update an inviter (message/status)
router.put('/:id', protect, updateConfirmation);

// Mark an inviter as sent
router.put('/:id/send', protect, sendConfirmation);

// Batch sending is not implemented on this branch; use single-send per inviter.

export default router;
