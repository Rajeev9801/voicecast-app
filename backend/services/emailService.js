import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dotenv is loaded from the correct location (backend root)
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("-----------------------------------------");
console.log("📧 [MAIL-INIT] Initializing Email Service");
console.log("📧 [MAIL-INIT] User:", process.env.EMAIL_USER || "MISSING");
console.log("📧 [MAIL-INIT] Pass:", process.env.EMAIL_PASS ? "********" : "MISSING");
console.log("-----------------------------------------");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
export const verifyMailConnection = async () => {
  try {
    console.log("📧 [MAIL-VERIFY] Checking SMTP connection...");
    await transporter.verify();
    console.log("✅ [MAIL-VERIFY] SMTP READY - Connection established");
    return true;
  } catch (error) {
    console.error("❌ [MAIL-VERIFY] SMTP FAILED");
    console.error("   Error Message:", error.message);
    if (error.code === 'EAUTH') {
      console.error("   Reason: Authentication failed. Please check EMAIL_USER and EMAIL_PASS (App Password).");
    }
    return false;
  }
};

export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const subject = purpose === 'verification' ? 'Email Verification - VoiceCast' : 'Password Reset - VoiceCast';
  const text = purpose === 'verification' 
    ? `Your verification code is: ${otp}. This code will expire in 10 minutes.`
    : `Your password reset code is: ${otp}. This code will expire in 10 minutes.`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: text,
  };

  try {
    console.log(`📧 [MAIL-SEND] Attempting to send ${purpose} OTP to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [MAIL-SUCCESS] Email sent to ${email}. Response: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`❌ [MAIL-FAILED] Error sending ${purpose} email to ${email}`);
    console.error("   Error Code:", error.code);
    console.error("   Error Message:", error.message);
    if (error.response) console.error("   SMTP Response:", error.response);
    return false;
  }
};
