// import ConfirmationGuest from '../models/confirmation.model.js';

// // Get all confirmations
// export const getAllConfirmations = async (req, res) => {
//   try {
//     const confirmations = await ConfirmationGuest.find();
//     res.json(confirmations);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

import ConfirmationGuest from '../models/confirmation.model.js';

// GET all confirmations
export const getAllConfirmations = async (req, res) => {
  try {
    // allow optional filtering by eventId or userId via query params
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.userId) filter.userId = req.query.userId;
    const confirmations = await ConfirmationGuest.find(filter);
    res.status(200).json(confirmations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch confirmations' });
  }
};

// GET inviters for the authenticated user (requires protect middleware)
export const getInvitersForUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user;
    if (!userId) return res.status(400).json({ error: 'User id missing' });
    const filter = { userId };
    if (req.query.eventId) filter.eventId = req.query.eventId;
    const confirmations = await ConfirmationGuest.find(filter);
    res.status(200).json(confirmations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inviters for user' });
  }
};

// POST new confirmation
export const addConfirmation = async (req, res) => {
  try {
    // Accept userId and eventId from the client and store them explicitly
    const { userId, eventId, guestName, guestEmail, phone, message, numberOfPeople } = req.body;
    const payload = {
      guestName,
      guestEmail,
      phone,
      message,
      numberOfPeople: numberOfPeople || 1,
    };
    if (userId) payload.userId = userId;
    if (eventId) payload.eventId = eventId;

    const newConfirmation = new ConfirmationGuest(payload);
    await newConfirmation.save();
    res.status(201).json({ message: 'Confirmation added', data: newConfirmation });
  } catch (err) {
    res.status(400).json({ error: 'Failed to add confirmation' });
  }
};

// UPDATE confirmation/inviter (e.g., update message or status)
export const updateConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const confirmation = await ConfirmationGuest.findById(id);
    if (!confirmation) return res.status(404).json({ error: 'Confirmation not found' });

    // ensure only the owner can update
    const requester = req.user?.id || req.user?._id;
    if (requester && String(confirmation.userId) !== String(requester)) {
      return res.status(403).json({ error: 'Not authorized to update this confirmation' });
    }

    const updates = {};
    if (req.body.message !== undefined) updates.message = req.body.message;
    if (req.body.status !== undefined) updates.status = req.body.status;

    const updated = await ConfirmationGuest.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: 'Confirmation updated', data: updated });
  } catch (err) {
    console.error('updateConfirmation error', err);
    res.status(400).json({ error: err.message || 'Failed to update confirmation' });
  }
};

// mark a confirmation as sent (simple implementation for demo/testing)
export const sendConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const confirmation = await ConfirmationGuest.findById(id);
    if (!confirmation) return res.status(404).json({ error: 'Confirmation not found' });

    const requester = req.user?.id || req.user?._id;
    if (requester && String(confirmation.userId) !== String(requester)) {
      return res.status(403).json({ error: 'Not authorized to send this confirmation' });
    }

    confirmation.status = 'sent';
    confirmation.sentAt = new Date();
    await confirmation.save();

    res.status(200).json({ message: 'Marked as sent', data: confirmation });
  } catch (err) {
    console.error('sendConfirmation error', err);
    res.status(400).json({ error: err.message || 'Failed to mark as sent' });
  }
};

