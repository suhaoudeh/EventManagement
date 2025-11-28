import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in the environment');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


// Register user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    let token;
    try {
      token = generateToken(user._id);
    } catch (tErr) {
      console.error('Token generation failed:', tErr);
      return res.status(500).json({ error: 'Server configuration error' });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error('registerUser error:', err);
    // Duplicate key (email) error
    if (err && err.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    // Validation error
    if (err && err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join('; ');
      return res.status(400).json({ error: messages || 'Validation error' });
    }

    res.status(500).json({ error: 'Server error' });
  }
};



// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
  if (user && await user.comparePassword(password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
