import ConfirmationGuest from '../models/confirmation.model.js';
import Event from '../models/event.model.js';
import { Resend } from 'resend';

import nodemailer from 'nodemailer';
// ------------------------
// Setup Resend (make sure dotenv is loaded in server.js)
// ------------------------
let resend = null;
if (process.env.RESEND_API_KEY) {
  try {
    resend = new Resend(process.env.RESEND_API_KEY);
  } catch (e) {
    console.warn('Failed to initialize Resend client:', e && e.message ? e.message : e);
    resend = null;
  }
} else {
  console.warn('RESEND_API_KEY not set; email sending will use dev fallback (console)');
}

// ------------------------
// Helper: Build invitation HTML
// ------------------------
const buildInvitationHtml = (confirmation, event) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
    <h2 style="color: #333;">You're Invited!</h2>
    <p>Hi <strong>${confirmation.guestName || 'Guest'}</strong>,</p>
    <p>You have been invited to attend <strong>${event?.title || 'an event'}</strong>.</p>
    ${confirmation.message ? `<p><em>${confirmation.message}</em></p>` : ''}
    <p><strong>Date:</strong> ${event?.date ? new Date(event.date).toLocaleString() : 'TBA'}</p>
    <p style="margin-top: 20px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/invitations/${confirmation._id}"
         style="padding: 12px 20px; background: #0066ff; color: white; text-decoration: none; border-radius: 6px;">
        View Your Invitation
      </a>
    </p>
    <br>
    <p>Best regards,<br/>Event Management Team</p>
  </div>
`;

const sendEmailForConfirmation = async (confirmation, event) => {
  try {
    // 1) Prefer Resend if configured
    if (resend) {
      const emailData = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: confirmation.guestEmail,
        subject: `Invitation: ${event?.title || 'You are invited'}`,
        html: buildInvitationHtml(confirmation, event),
      });
      console.log('Email sent via Resend:', emailData);
      return { ok: true };
    }

    // 2) SMTP fallback
    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').trim();
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const secure = smtpPort === 465;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('SMTP credentials missing (SMTP_HOST/SMTP_USER/SMTP_PASS)');
      return { ok: false, error: 'SMTP credentials missing' };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || smtpUser,
      to: confirmation.guestEmail,
      subject: `Invitation: ${event?.title || 'You are invited'}`,
      html: buildInvitationHtml(confirmation, event),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent via SMTP:', info.messageId || info);
    return { ok: true };
  } catch (err) {
    console.error('sendEmailForConfirmation error:', err);
    return { ok: false, error: err.message || String(err) };
  }
};


// ------------------------
// Controller: Add new confirmation
// ------------------------
export const addConfirmation = async (req, res) => {
  try {
    const { userId, eventId, guestName, guestEmail, phone, message, numberOfPeople } = req.body;
    const newConfirmation = new ConfirmationGuest({
      guestName, guestEmail, phone, message,
      numberOfPeople: numberOfPeople || 1,
      userId, eventId,
    });
    await newConfirmation.save();
    res.status(201).json({ message: 'Confirmation added', data: newConfirmation });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to add confirmation' });
  }
};

// ------------------------
// Controller: Send a single confirmation email
// ------------------------
export const sendConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const confirmation = await ConfirmationGuest.findById(id);
    if (!confirmation) return res.status(404).json({ error: 'Confirmation not found' });

    const event = confirmation.eventId ? await Event.findById(confirmation.eventId).lean() : null;

    const sendResult = await sendEmailForConfirmation(confirmation, event);

    confirmation.status = sendResult.ok ? 'sent' : 'failed';
    confirmation.sentAt = new Date();
    await confirmation.save();

    if (sendResult.ok) {
      return res.status(200).json({ message: 'Email sent successfully', data: confirmation });
    } else {
      return res.status(500).json({ error: 'Failed to send email', details: sendResult.error });
    }
  } catch (err) {
    console.error('sendConfirmation error:', err);
    res.status(500).json({ error: 'Failed to send confirmation email', details: err.message });
  }
};

// ------------------------
// Controller: Get all confirmations
// ------------------------
export const getAllConfirmations = async (req, res) => {
  try {
    const filter = {};
    if (req.query && req.query.eventId) filter.eventId = req.query.eventId;
    // Prefer explicit query.userId, otherwise fall back to authenticated user
    if (req.query && req.query.userId) {
      filter.userId = req.query.userId;
    } else if (req.user && (req.user.id || req.user._id)) {
      filter.userId = req.user.id || req.user._id;
    }

    const confirmations = await ConfirmationGuest.find(filter);
    res.status(200).json(confirmations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch confirmations' });
  }
};

// ------------------------
// Controller: Update confirmation
// ------------------------
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
