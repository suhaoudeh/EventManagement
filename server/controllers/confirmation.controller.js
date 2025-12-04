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

// import ConfirmationGuest from '../models/confirmation.model.js';

// // GET all confirmations
// export const getAllConfirmations = async (req, res) => {
//   try {
//     // allow optional filtering by eventId or userId via query params
//     const filter = {};
//     if (req.query.eventId) filter.eventId = req.query.eventId;
//     if (req.query.userId) filter.userId = req.query.userId;
//     const confirmations = await ConfirmationGuest.find(filter);
//     res.status(200).json(confirmations);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch confirmations' });
//   }
// };

// // GET inviters for the authenticated user (requires protect middleware)
// export const getInvitersForUser = async (req, res) => {
//   try {
//     const userId = req.user?.id || req.user?._id || req.user;
//     if (!userId) return res.status(400).json({ error: 'User id missing' });
//     const filter = { userId };
//     if (req.query.eventId) filter.eventId = req.query.eventId;
//     const confirmations = await ConfirmationGuest.find(filter);
//     res.status(200).json(confirmations);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch inviters for user' });
//   }
// };

// // POST new confirmation
// export const addConfirmation = async (req, res) => {
//   try {
//     // Accept userId and eventId from the client and store them explicitly
//     const { userId, eventId, guestName, guestEmail, phone, message, numberOfPeople } = req.body;
//     const payload = {
//       guestName,
//       guestEmail,
//       phone,
//       message,
//       numberOfPeople: numberOfPeople || 1,
//     };
//     if (userId) payload.userId = userId;
//     if (eventId) payload.eventId = eventId;

//     const newConfirmation = new ConfirmationGuest(payload);
//     await newConfirmation.save();
//     res.status(201).json({ message: 'Confirmation added', data: newConfirmation });
//   } catch (err) {
//     res.status(400).json({ error: 'Failed to add confirmation' });
//   }
// };

// // UPDATE confirmation/inviter (e.g., update message or status)
// export const updateConfirmation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const confirmation = await ConfirmationGuest.findById(id);
//     if (!confirmation) return res.status(404).json({ error: 'Confirmation not found' });

//     // ensure only the owner can update
//     const requester = req.user?.id || req.user?._id;
//     if (requester && String(confirmation.userId) !== String(requester)) {
//       return res.status(403).json({ error: 'Not authorized to update this confirmation' });
//     }

//     const updates = {};
//     if (req.body.message !== undefined) updates.message = req.body.message;
//     if (req.body.status !== undefined) updates.status = req.body.status;

//     const updated = await ConfirmationGuest.findByIdAndUpdate(id, updates, { new: true });
//     res.status(200).json({ message: 'Confirmation updated', data: updated });
//   } catch (err) {
//     console.error('updateConfirmation error', err);
//     res.status(400).json({ error: err.message || 'Failed to update confirmation' });
//   }
// };

// // mark a confirmation as sent (simple implementation for demo/testing)
// export const sendConfirmation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const confirmation = await ConfirmationGuest.findById(id);
//     if (!confirmation) return res.status(404).json({ error: 'Confirmation not found' });

//     const requester = req.user?.id || req.user?._id;
//     if (requester && String(confirmation.userId) !== String(requester)) {
//       return res.status(403).json({ error: 'Not authorized to send this confirmation' });
//     }

//     confirmation.status = 'sent';
//     confirmation.sentAt = new Date();
//     await confirmation.save();

//     res.status(200).json({ message: 'Marked as sent', data: confirmation });
//   } catch (err) {
//     console.error('sendConfirmation error', err);
//     res.status(400).json({ error: err.message || 'Failed to mark as sent' });
//   }
// };

import ConfirmationGuest from '../models/confirmation.model.js';
import Event from '../models/event.model.js';
import nodemailer from 'nodemailer';

// Setup Mailtrap transporter
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT || 2525),
  secure: false, // Mailtrap does not need TLS on 2525
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Helper to build email HTML
const buildInvitationHtml = (confirmation, event) => {
  return `
    <p>Hi ${confirmation.guestName || 'Guest'},</p>
    <p>You are invited to <strong>${event?.title || 'an event'}</strong>.</p>
    <p>${confirmation.message || ''}</p>
    <p>Date: ${event?.date ? new Date(event.date).toLocaleString() : 'TBA'}</p>
    <p>RSVP link: <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/invitations/${confirmation._id}">View invitation</a></p>
    <p>Regards,<br/>${process.env.EMAIL_FROM || 'Organizer'}</p>
  `;
};

// Helper: send one confirmation using the configured transporter
const sendEmailForConfirmation = async (confirmation, event) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'no-reply@EventManagment.com',
      to: confirmation.guestEmail,
      subject: `Invitation: ${event?.title || 'You are invited'}`,
      html: buildInvitationHtml(confirmation, event),
    };

    await mailTransporter.sendMail(mailOptions);
    return { ok: true };
  } catch (err) {
    console.error('sendEmailForConfirmation error:', err);
    return { ok: false, error: err.message || String(err) };
  }
};

// Batch send: sends multiple confirmations with controlled concurrency
export const sendBatch = async (req, res) => {
  try {
    const { ids, eventId } = req.body || {};

    let filter = {};
    if (Array.isArray(ids) && ids.length) {
      filter._id = { $in: ids };
    } else if (eventId) {
      filter.eventId = eventId;
    } else {
      return res.status(400).json({ error: 'Provide `ids` or `eventId` in request body' });
    }

    // if route is protected, limit to user's confirmations only
    const requester = req.user?.id || req.user?._id;
    if (requester) filter.userId = requester;

    const confirmations = await ConfirmationGuest.find(filter);
    if (!confirmations.length) return res.status(404).json({ error: 'No confirmations found' });

    const batchSize = Number(process.env.EMAIL_BATCH_SIZE || 5);
    const results = [];

    for (let i = 0; i < confirmations.length; i += batchSize) {
      const chunk = confirmations.slice(i, i + batchSize);
      const promises = chunk.map(async (c) => {
        const event = c.eventId ? await Event.findById(c.eventId).lean() : null;
        const sendResult = await sendEmailForConfirmation(c, event);
        if (sendResult.ok) {
          c.status = 'sent';
          c.sentAt = new Date();
          await c.save();
          return { id: c._id, ok: true };
        }
        c.status = 'failed';
        c.sentAt = new Date();
        await c.save();
        return { id: c._id, ok: false, error: sendResult.error };
      });

      const settled = await Promise.all(promises);
      results.push(...settled);

      // small delay between batches to avoid provider throttling
      if (i + batchSize < confirmations.length) await new Promise((r) => setTimeout(r, 500));
    }

    res.status(200).json({ results, total: confirmations.length });
  } catch (err) {
    console.error('sendBatch error:', err);
    res.status(500).json({ error: 'Failed to send batch', details: err.message });
  }
};

export const sendConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const confirmation = await ConfirmationGuest.findById(id);
    if (!confirmation) return res.status(404).json({ error: 'Confirmation not found' });

    const event = confirmation.eventId ? await Event.findById(confirmation.eventId).lean() : null;

    if (!mailTransporter) {
      console.warn('No mail transporter configured.');
      return res.status(500).json({ error: 'Email provider not configured' });
    }

    // Verify SMTP connection before sending
    mailTransporter.verify((err, success) => {
      if (err) {
        console.error('SMTP Verification Failed:', err);
      } else {
        console.log('SMTP Server is ready to send messages');
      }
    });

    // Use helper to send email and record status
    const sendResult = await sendEmailForConfirmation(confirmation, event);

    if (sendResult.ok) {
      confirmation.status = 'sent';
      confirmation.sentAt = new Date();
      await confirmation.save();
      return res.status(200).json({ message: 'Email sent successfully', data: confirmation });
    }

    // mark failed
    confirmation.status = 'failed';
    confirmation.sentAt = new Date();
    await confirmation.save();
    res.status(500).json({ error: 'Failed to send confirmation email', details: sendResult.error });
  } catch (err) {
    console.error('sendConfirmation error:', err);
    res.status(500).json({ error: 'Failed to send confirmation email', details: err.message });
  }
};
export const addConfirmation = async (req, res) => {
  try {
    const { userId, eventId, guestName, guestEmail, phone, message, numberOfPeople } = req.body;
    const payload = { guestName, guestEmail, phone, message, numberOfPeople: numberOfPeople || 1 };
    if (userId) payload.userId = userId;
    if (eventId) payload.eventId = eventId;

    const newConfirmation = new ConfirmationGuest(payload);
    await newConfirmation.save();
    res.status(201).json({ message: 'Confirmation added', data: newConfirmation });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to add confirmation' });
  }
};
// --- Exported controller functions ---
export const getAllConfirmations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.userId) filter.userId = req.query.userId;
    const confirmations = await ConfirmationGuest.find(filter);
    res.status(200).json(confirmations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch confirmations' });
  }
};
export const getInvitersForUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user;
    if (!userId) return res.status(400).json({ error: 'User id missing' });
    const filter = { userId };
    if (req.query.eventId) filter.eventId = req.query.eventId;
    const confirmations = await ConfirmationGuest.find(filter);
    res.status(200).json(confirmations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch inviters for user' });
  }
};
export const updateConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const confirmation = await ConfirmationGuest.findById(id);
    if (!confirmation) return res.status(404).json({ error: 'Confirmation not found' });

    const requester = req.user?.id || req.user?._id;
    if (requester && String(confirmation.userId) !== String(requester))
      return res.status(403).json({ error: 'Not authorized' });

    const updates = {};
    if (req.body.message !== undefined) updates.message = req.body.message;
    if (req.body.status !== undefined) updates.status = req.body.status;

    const updated = await ConfirmationGuest.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: 'Confirmation updated', data: updated });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update confirmation' });
  }
};
