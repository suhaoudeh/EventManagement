import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM,   // onboarding@resend.dev
      to,
      subject,
      html,
    });

    console.log("Email sent:", data);
    return data;
  } catch (error) {
    console.error("Resend Email Error:", error);
    throw error;
  }
};
