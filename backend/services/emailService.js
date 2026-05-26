import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

console.log("-----------------------------------------");
console.log("📧 [MAIL-INIT] Initializing Nodemailer Service");
console.log("📧 [MAIL-INIT] User:", EMAIL_USER);
console.log("📧 [MAIL-INIT] Pass Status:", EMAIL_PASS ? "CONFIGURED" : "MISSING");
console.log("-----------------------------------------");

// Create Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify connection
export const verifyMailConnection = async () => {
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error("❌ [MAIL-VERIFY] FAILED - Credentials missing");
      return false;
    }
    await transporter.verify();
    console.log("✅ [MAIL-VERIFY] READY - Connection established");
    return true;
  } catch (error) {
    console.error("❌ [MAIL-VERIFY] FAILED:", error.message);
    return false;
  }
};

export const getMailDiagnostics = () => {
  return {
    provider: 'Gmail',
    user_set: !!EMAIL_USER,
    pass_set: !!EMAIL_PASS,
    node_env: process.env.NODE_ENV
  };
};

export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  // Security Lockdown: Never log OTP in production
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔐 [MAIL-DEBUG] Generated OTP for ${email}: ${otp}`);
  }

  const subject = purpose === 'verification' ? 'Email Verification - VoiceCast' : 'Password Reset - VoiceCast';
  const text = `Your ${purpose} code is: ${otp}. This code will expire in 10 minutes.`;

  const mailOptions = {
    from: EMAIL_USER,
    to: email.trim(),
    subject: subject,
    text: text,
  };

  try {
    console.log(`📧 [MAIL-SEND] Dispatching ${purpose} code to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [MAIL-SUCCESS] Message sent. Response:", info.response);
    return true;
  } catch (error) {
    console.error("❌ [MAIL-EXCEPTION]:", error.message);
    throw new Error(`Email Delivery Failure: ${error.message}`);
  }
};
