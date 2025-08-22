// server/utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; // <-- STEP 1: Import dotenv

// --- THIS IS THE CRITICAL FIX ---
// We call dotenv.config() right at the top of this file.
// This ensures that the environment variables (EMAIL_HOST, EMAIL_USER, etc.)
// are loaded and available within this specific module, regardless of where it's called from.
dotenv.config();

const sendEmail = async (options) => {
  // 1. Create a "transporter" - an object that is able to send email.
  // This configuration tells Nodemailer how to connect to the Gmail SMTP server.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // For port 587, secure must be false. Nodemailer will upgrade the connection using STARTTLS.
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address from the .env file
      pass: process.env.EMAIL_PASS, // Your 16-character App Password from the .env file
    },
    // It's good practice to add a timeout
    connectionTimeout: 10000, // 10 seconds
  });

  // 2. Define the email options (who it's from, who it's to, subject, and content).
  const mailOptions = {
    from: `IIT Marketplace <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: `<b>${options.message}</b>` // You could also send HTML content
  };

  try {
    // 3. Actually send the email using the transporter and options.
    console.log("Attempting to send email to:", options.email);
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully! Message ID:", info.messageId);
  } catch (error) {
    // If Nodemailer fails to send the email, log the detailed error to the backend console.
    console.error("--- NODEMAILER ERROR ---");
    console.error("Failed to send email. Please check your .env credentials and Gmail settings.", error);
    // We re-throw the error so the controller that called this function knows it failed.
    throw new Error("Email could not be sent.");
  }
};

export default sendEmail;