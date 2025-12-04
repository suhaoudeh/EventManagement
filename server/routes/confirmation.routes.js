// import express from 'express';
// import { getAllConfirmations, addConfirmation } from '../controllers/confirmation.controller.js';

// const router = express.Router();

// // GET all confirmations
// router.get('/', getAllConfirmations);
// //router.post('/', getAllConfirmations);
// router.put('/', getAllConfirmations);
// router.delete('/', getAllConfirmations);
// router.patch('/', getAllConfirmations);
// router.post('/', addConfirmation);



// export default router;

import express from 'express';
import {
  getAllConfirmations,
  getInvitersForUser,
  addConfirmation,
  updateConfirmation,
  sendConfirmation
} from '../controllers/confirmation.controller.js';


import { protect } from '../middleware/auth.js';
const authMiddleware = protect;

const router = express.Router();

// GET all confirmations
router.get('/', getAllConfirmations);

// Get inviters for logged-in user
router.get('/my-inviters', authMiddleware, getInvitersForUser);

// Add a new confirmation (invite guest)
router.post('/', addConfirmation);

// Update confirmation (message/status)
router.put('/:id', authMiddleware, updateConfirmation);
router.patch('/:id', authMiddleware, updateConfirmation);

// ❗️ SEND EMAIL INVITATION (THIS IS WHAT YOU ARE MISSING)
router.post('/:id/send', authMiddleware, sendConfirmation);

export default router;
