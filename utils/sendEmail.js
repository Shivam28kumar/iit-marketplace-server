// server/utils/sendEmail.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables into this module.
dotenv.config();

const sendEmail = async (options) => {
  // Create a transporter object using Gmail's SMTP settings.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define the email content.
  const mailOptions = {
    from: `IIT Marketplace <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send the email.
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;