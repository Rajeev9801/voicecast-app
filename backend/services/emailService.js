import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const MAIL_PROVIDER = process.env.MAIL_PROVIDER || 'gmail';

console.log("-----------------------------------------");
console.log("📧 [MAIL-INIT] Initializing Nodemailer Service");
console.log("📧 [MAIL-INIT] Provider:", MAIL_PROVIDER);
console.log("📧 [MAIL-INIT] User:", EMAIL_USER);
console.log("📧 [MAIL-INIT] Pass Status:", EMAIL_PASS ? "CONFIGURED" : "MISSING");
console.log("-----------------------------------------");

// Create Transporter with explicit Gmail SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  // Add timeout to prevent hanging
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify connection
export const verifyMailConnection = async () => {
  try {
    console.log("📧 [MAIL-VERIFY] Checking connection...");
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error("❌ [MAIL-VERIFY] FAILED - Credentials missing (EMAIL_USER or EMAIL_PASS)");
      return false;
    }
    
    // Using a timeout for verify as well
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Verification Timeout')), 10000)
    );

    await Promise.race([verifyPromise, timeoutPromise]);
    console.log("✅ [MAIL-VERIFY] READY - Connection established with smtp.gmail.com");
    return true;
  } catch (error) {
    console.error("❌ [MAIL-VERIFY] FAILED:", error.message);
    return false;
  }
};

export const getMailDiagnostics = () => {
  return {
    provider: MAIL_PROVIDER,
    host: 'smtp.gmail.com',
    port: 587,
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

  const subjects = {
    'verification': 'Email Verification - VoiceCast',
    'reset': 'Password Reset - VoiceCast',
    'admin_otp': 'Admin Access Code - VoiceCast',
    'artist_auth': 'Artist Authentication - VoiceCast'
  };

  const subject = subjects[purpose] || 'Verification Code - VoiceCast';
  const text = `Your ${purpose.replace('_', ' ')} code is: ${otp}. This code will expire in 10 minutes.`;

  const mailOptions = {
    from: `"VoiceCast Support" <${EMAIL_USER}>`,
    to: email.trim(),
    subject: subject,
    text: text,
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
    console.log(`📧 [MAIL-SEND] Dispatching ${purpose} code to: ${email}`);
    
    // Send email with timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email Delivery Timeout')), 15000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log("✅ [MAIL-SUCCESS] Message sent. MessageId:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ [MAIL-EXCEPTION]:", error.message);
    
    // Provide detailed error information
    let detailedMessage = error.message;
    if (error.code === 'EAUTH') {
      detailedMessage = "Authentication failed. Please check EMAIL_USER and EMAIL_PASS (App Password might be needed).";
    } else if (error.code === 'ESOCKET') {
      detailedMessage = "Network error. Could not connect to smtp.gmail.com.";
    } else if (error.message === 'Email Delivery Timeout') {
      detailedMessage = "Email delivery timed out. Gmail SMTP might be slow or blocked.";
    }

    throw new Error(detailedMessage);
  }
};
