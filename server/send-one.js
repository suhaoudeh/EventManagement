import dotenv from 'dotenv';
dotenv.config();

const recipient = process.env.SEND_TO || 'suha.oudeh@hotmail.com';
const subject = 'Invitation: Information Technology workshop 4';
const html = `
  <p>Hi suha oudeh,</p>
  <p>You are invited to <strong>Information Technology workshop 4 </strong>.</p>
  <p>welcome</p>
  <p>Date: 11/25/2025, 2:00:00 PM</p>
  <p>RSVP link: <a href="http://localhost:3000/invitations/692a647711a1d94902baed80">View invitation</a></p>
  <p>Regards,<br/>${process.env.EMAIL_FROM || 'no-reply@EventManagment.com'}</p>
`;

(async () => {
  // Try SendGrid if configured
  if (process.env.SENDGRID_API_KEY) {
    try {
      const sgMail = await import('@sendgrid/mail');
      sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: recipient,
        from: process.env.EMAIL_FROM,
        subject,
        html,
      };
      const res = await sgMail.default.send(msg);
      console.log('SendGrid send result:', res && res[0] && res[0].statusCode ? res[0].statusCode : 'ok');
      return;
    } catch (e) {
      console.error('SendGrid send failed:', e && e.message ? e.message : e);
      // fall through to try SMTP
    }
  }

  // Try SMTP via nodemailer if configured
  if (process.env.SMTP_HOST && process.env.EMAIL_FROM) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true' || false,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: recipient,
        subject,
        html,
      });
      console.log('SMTP send result:', info);
      return;
    } catch (e) {
      console.error('SMTP send failed:', e && e.message ? e.message : e);
    }
  }

  // Development fallback
  if (process.env.NODE_ENV !== 'production') {
    console.warn('No email provider configured — logging email to console (dev fallback)');
    console.log('--- EMAIL PREVIEW ---');
    console.log('From:', process.env.EMAIL_FROM || '<not-set>');
    console.log('To:', recipient);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    console.log('--- END PREVIEW ---');
    return;
  }

  console.error('No email provider configured (SENDGRID_API_KEY or SMTP_HOST + EMAIL_FROM required)');
})();
