import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Force IPv4 globally for DNS resolution
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

console.log("-----------------------------------------");
console.log("📧 [MAIL-INIT] Initializing Nodemailer Service (Gmail Service Patch)");
console.log("📧 [MAIL-MODE] Gmail service mode enabled");
console.log("📧 [MAIL-NET] IPv4 enforced");
console.log("📧 [MAIL-INIT] User:", EMAIL_USER);
console.log("-----------------------------------------");

// Create Transporter using Gmail Service Mode
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  family: 4 // Still force IPv4
});

// Non-blocking connection check
export const verifyMailConnection = async () => {
  try {
    console.log("📧 [MAIL-VERIFY] Running background connection check...");
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("⚠️ [MAIL-VERIFY] Credentials missing, skipping verify.");
      return false;
    }
    
    // Non-blocking verify
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ [MAIL-VERIFY] Background Check FAILED (Service Mode):", error.message);
      } else {
        console.log("✅ [MAIL-VERIFY] READY - Gmail Service Connection Verified");
      }
    });
    
    return true; 
  } catch (error) {
    console.error("❌ [MAIL-VERIFY] EXCEPTION:", error.message);
    return false;
  }
};

export const getMailDiagnostics = () => {
  return {
    provider: 'gmail_service',
    ipv4_enforced: true,
    user_set: !!EMAIL_USER,
    pass_set: !!EMAIL_PASS,
    node_env: process.env.NODE_ENV
  };
};

export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔐 [MAIL-DEBUG] Generated OTP for ${email}: ${otp}`);
  }

  const subjects = {
    'verification': 'Email Verification - VoiceCast',
    'reset': 'Password Reset - VoiceCast',
    'admin_otp': 'Admin Access Code - VoiceCast',
    'artist_auth': 'Artist Authentication - VoiceCast'
  };

  const subject = subjects[purpose] || 'Verification Code - VoiceCast';
  
  const mailOptions = {
    from: `"VoiceCast Support" <${EMAIL_USER}>`,
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
    console.log(`📧 [MAIL-SEND] Dispatching to: ${email} via Gmail Service...`);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [MAIL-SUCCESS] Sent! MessageId:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ [MAIL-EXCEPTION] Runtime Error:", error.message);
    throw new Error(`Email Delivery Failure: ${error.message}`);
  }
};
