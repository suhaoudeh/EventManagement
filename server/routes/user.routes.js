import express from 'express';
import { getUsers } from '../controllers/user.controller.js';
import { register, login } from '../controllers/user.controller.js';

//import { getUsers } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js'; 
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
//router.get('/', protect, getUsers); // Example protected route to get all users
router.get('/', protect, getUsers);


export default router;
