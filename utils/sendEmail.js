// server/utils/sendEmail.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com', // Fallback to gmail if env missing
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // --- FIX FOR CLOUD SERVERS ---
    // This allows the connection even if the server's certificate is self-signed
    // or has verification issues, which is common in some cloud environments.
    tls: {
      rejectUnauthorized: false
    },
    // Increase timeout to 20 seconds
    connectionTimeout: 20000, 
    greetingTimeout: 20000,
    socketTimeout: 20000, 
  });

  // 2. Define email options
  const mailOptions = {
    from: `"IIT Marketplace" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #232f3e;">IIT Marketplace</h2>
        <p style="font-size: 16px;">${options.message.replace(/\n/g, '<br>')}</p>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">This is an automated message.</p>
      </div>
    `, 
  };

  // 3. Send email
  try {
    console.log(`Attempting to send email to: ${options.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;