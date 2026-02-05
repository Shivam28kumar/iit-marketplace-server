// server/utils/sendEmail.js
const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Resend with your API Key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    console.log(`[Resend API] Sending email to: ${options.email}`);

    const { data, error } = await resend.emails.send({
      // IMPORTANT: On the free tier, you must send from this address:
      from: 'IIT Marketplace <onboarding@resend.dev>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ff7a00;">IIT Marketplace</h2>
          <p style="font-size: 16px; line-height: 1.5;">${options.message.replace(/\n/g, '<br>')}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">This is an automated security code for your campus account.</p>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      throw new Error("Failed to send email via API.");
    }

    console.log(`[Resend API] Email Sent! ID: ${data.id}`);
    return data;

  } catch (err) {
    console.error("[Resend API] Critical Failure:", err);
    throw new Error("Email service currently unavailable.");
  }
};

module.exports = sendEmail;