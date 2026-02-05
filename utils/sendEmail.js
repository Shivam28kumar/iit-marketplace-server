// server/utils/sendEmail.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // We explicitly use Port 465 for SSL which is more stable on Render
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // MUST be true for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // This helps prevent connection drops on cloud servers
      rejectUnauthorized: false
    },
    connectionTimeout: 20000, 
  });

  const mailOptions = {
    from: `"IIT Marketplace" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
             <h2 style="color: #ff7a00;">IIT Marketplace</h2>
             <p>${options.message.replace(/\n/g, '<br>')}</p>
           </div>`,
  };

  try {
    console.log(`Attempting SSL connection to Gmail for: ${options.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error("Nodemailer Detail Error:", error);
    throw new Error("Email could not be sent.");
  }
};

module.exports = sendEmail;