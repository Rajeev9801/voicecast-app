import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const rawKey = process.env.RESEND_API_KEY || '';

// SANITIZATION: Force cleaning of the key
const RESEND_API_KEY = rawKey.replace(/[\"\'\s\(\)\[\]]/g, '').trim();

console.log("-----------------------------------------");
console.log("📧 [RESEND-DEBUG] Runtime Diagnostics");
console.log("RAW LENGTH:", rawKey.length);
console.log("SANITIZED LENGTH:", RESEND_API_KEY.length);
console.log("SANITIZED START:", RESEND_API_KEY.substring(0, 7) + "...");
console.log("-----------------------------------------");

// Initialize with SANITIZED key
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const verifyMailConnection = async () => {
  return !!resend && RESEND_API_KEY.startsWith('re_') && RESEND_API_KEY.length > 20;
};

export const getResendDiagnostics = () => {
  return {
    raw_key_exists: !!rawKey,
    raw_key_length: rawKey.length,
    sanitized_key_length: RESEND_API_KEY.length,
    sanitized_key_prefix: RESEND_API_KEY ? RESEND_API_KEY.substring(0, 7) : 'NONE',
    initialized: !!resend,
    node_env: process.env.NODE_ENV
  };
};

export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  if (!resend) {
    throw new Error("Resend client not initialized. Check RESEND_API_KEY.");
  }

  const subject = purpose === 'verification' ? 'Email Verification - VoiceCast' : 'Password Reset - VoiceCast';
  const text = `Your ${purpose} code is: ${otp}. This code will expire in 10 minutes.`;

  console.log(`📧 [RESEND-SEND] Sending ${purpose} code to: ${email}`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'VoiceCast <onboarding@resend.dev>',
      to: [email.trim()],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error("❌ [RESEND-API-FAILURE]:", error);
      throw new Error(`Resend API Failure: ${error.message}`);
    }

    console.log("✅ [RESEND-SUCCESS] ID:", data?.id);
    return true;
  } catch (error) {
    console.error("🔥 [RESEND-EXCEPTION]:", error.message);
    throw error;
  }
};
