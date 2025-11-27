import express from 'express';
import { getAllConfirmations, addConfirmation } from '../controllers/confirmation.controller.js';

const router = express.Router();

// GET all confirmations
router.get('/', getAllConfirmations);
//router.post('/', getAllConfirmations);
router.put('/', getAllConfirmations);
router.delete('/', getAllConfirmations);
router.patch('/', getAllConfirmations);
router.post('/', addConfirmation);



export default router;
