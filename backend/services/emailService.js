import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SENDER_NAME = "VoiceCast Support";

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

// Maintain interface for server.js compatibility
export const verifyMailConnection = async () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("⚠️ [MAIL] EMAIL_USER or EMAIL_PASS missing from environment");
    return false;
  }
  
  try {
    await transporter.verify();
    console.log("-----------------------------------------");
    console.log("📧 [MAIL] Nodemailer (Gmail) Ready");
    console.log("📧 [MAIL] Sender:", EMAIL_USER);
    console.log("-----------------------------------------");
    return true;
  } catch (error) {
    console.error("❌ [MAIL-VERIFY] FAILED:", error.message);
    return false;
  }
};

export const getMailDiagnostics = () => {
  return {
    provider: 'Nodemailer (Gmail SMTP)',
    user_set: !!EMAIL_USER,
    pass_set: !!EMAIL_PASS,
    sender: EMAIL_USER,
    node_env: process.env.NODE_ENV
  };
};

export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Email credentials not configured");
  }

  const subjects = {
    'verification': 'Email Verification - VoiceCast',
    'reset': 'Password Reset - VoiceCast',
    'admin_otp': 'Admin Access Code - VoiceCast',
    'artist_auth': 'Artist Authentication - VoiceCast'
  };

  const subject = subjects[purpose] || 'Verification Code - VoiceCast';
  
  const mailOptions = {
    from: `"${SENDER_NAME}" <${EMAIL_USER}>`,
    to: email.trim(),
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #4CAF50;">VoiceCast</h2>
        <p>Hello,</p>
        <p>Your <strong>${purpose.replace('_', ' ')}</strong> code is:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #333;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">This is an automated message from VoiceCast. Please do not reply.</p>
      </div>
    `,
  };

  try {
    console.log(`📧 [MAIL] Sending OTP to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [MAIL] OTP sent successfully. MessageId:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ [MAIL-EXCEPTION] Nodemailer Error:", error.message);
    throw new Error(`Email Delivery Failure (Nodemailer): ${error.message}`);
  }
};
