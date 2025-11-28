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

// PUT /api/inviters/:id/send
// Marks an inviter as sent (sets status to 'sent' and records sentAt). Does not send email by itself.
export const sendInvitation = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Inviter id required' });

    const update = { status: 'sent', sentAt: new Date() };
    const updated = await ConfirmationGuest.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Inviter not found' });
    res.status(200).json({ message: 'Invitation marked as sent', data: updated });
  } catch (err) {
    console.error('Failed to mark invitation as sent', err);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
};

