// import Event from '../models/event.model.js';

// export const getAllEvents = async (req, res) => {
//   try {
//     const events = await Event.find().populate('createdBy', 'name email');
//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const createEvent = async (req, res) => {
//   try {
//     // attach the authenticated user as creator when available
//     const payload = { ...req.body };
//     if (req.user && req.user.id) payload.createdBy = req.user.id;
//     const event = new Event(payload);
//     await event.save();
//     res.status(201).json(event);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getEventsByUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const events = await Event.find({ createdBy: id }).populate('createdBy', 'name email');
//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get events for the currently authenticated user
// export const getMyEvents = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ error: 'Not authorized' });
//     const events = await Event.find({ createdBy: userId }).populate('createdBy', 'name email');
//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const updateEvent = async (req, res) => {
//   try {
//     const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(event);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// export const deleteEvent = async (req, res) => {
//   try {
//     await Event.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Event deleted' });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

import Event from '../models/event.model.js';

// GET all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('user_ID', 'name email'); // populate user info

    // Rename user_ID to createdBy in response
    const formattedEvents = events.map(event => ({
      ...event._doc,
      createdBy: event.user_ID,
      user_ID: undefined
    }));

    res.status(200).json(formattedEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET events by specific user ID
export const getEventsByUser = async (req, res) => {
  try {
    const { id } = req.params; // the user ID
    const events = await Event.find({ user_ID: id })
      .populate('user_ID', 'name email');

    // rename user_ID to createdBy
    const formattedEvents = events.map(event => ({
      ...event._doc,
      createdBy: event.user_ID,
      user_ID: undefined
    }));

    res.json(formattedEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET events for currently authenticated user
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const events = await Event.find({ user_ID: userId }).populate('user_ID', 'name email');

    const formattedEvents = events.map(event => ({
      ...event._doc,
      createdBy: event.user_ID,
      user_ID: undefined
    }));

    res.json(formattedEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// CREATE a new event
export const createEvent = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user && req.user.id) payload.user_ID = req.user.id;

    const event = new Event(payload);
    await event.save();

    // Populate user info for response
    await event.populate('user_ID', 'name email');

    res.status(201).json({
      ...event._doc,
      createdBy: event.user_ID,
      user_ID: undefined
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user_ID', 'name email');

    if (!event) return res.status(404).json({ error: 'Event not found' });

    res.json({
      ...event._doc,
      createdBy: event.user_ID,
      user_ID: undefined
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE event
export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

