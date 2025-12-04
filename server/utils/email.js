import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "3d7e5368a73397",
    pass: "fc51f202af5d6b"
  }
});

export const sendEmail = async (to, subject, message) => {
  try {
    await transporter.sendMail({
      from: '"Event Management" <no-reply@eventmanagement.com>', // name if the sender
      to,
      subject,
      html: message,
    });
    console.log("Email sent to: " + to);
  } catch (err) {
    console.error("Email Error:", err);
  }
};
