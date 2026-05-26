import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const rawKey = process.env.RESEND_API_KEY;
console.log("-----------------------------------------");
console.log("📧 [RESEND-DEBUG] Runtime Variable Check");
console.log("RAW KEY EXISTS:", !!rawKey);
console.log("RAW KEY LENGTH:", rawKey ? rawKey.length : 0);
console.log("RAW KEY START:", rawKey ? rawKey.substring(0, 7) : "N/A");
console.log("-----------------------------------------");

// Bare minimum initialization
const resend = rawKey ? new Resend(rawKey) : null;

export const verifyMailConnection = async () => {
  return !!resend && !!rawKey && rawKey.startsWith('re_');
};

export const getResendDiagnostics = () => {
  return {
    raw_key_exists: !!rawKey,
    raw_key_length: rawKey ? rawKey.length : 0,
    raw_key_prefix: rawKey ? rawKey.substring(0, 7) : 'NONE',
    initialized: !!resend,
    node_env: process.env.NODE_ENV
  };
};

export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  if (!resend) {
    console.error("🔥 [RESEND-ERROR] Attempted to send email but Resend is not initialized.");
    throw new Error("Resend client not initialized. Check RESEND_API_KEY in environment.");
  }

  const subject = purpose === 'verification' ? 'Email Verification - VoiceCast' : 'Password Reset - VoiceCast';
  const text = `Your ${purpose} code is: ${otp}. This code will expire in 10 minutes.`;

  console.log(`📧 [RESEND-SEND] Dispatching to: ${email}`);

  try {
    const response = await resend.emails.send({
      from: 'VoiceCast <onboarding@resend.dev>',
      to: [email.trim()],
      subject: subject,
      text: text,
    });

    if (response.error) {
      console.error("❌ [RESEND-API-ERROR]:", response.error);
      throw new Error(`Resend API Error: ${response.error.message}`);
    }

    console.log("✅ [RESEND-SUCCESS] Email dispatched successfully. ID:", response.data?.id);
    return true;
  } catch (error) {
    console.error("❌ [RESEND-EXCEPTION]:", error.message);
    throw error;
  }
};
