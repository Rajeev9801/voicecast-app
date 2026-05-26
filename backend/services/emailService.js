import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dotenv is loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

let rawKey = process.env.RESEND_API_KEY || '';
// SANITIZATION: Remove quotes, spaces, and brackets that users often copy-paste by mistake
const RESEND_API_KEY = rawKey.replace(/[\"\'\s\(\)\[\]]/g, '').trim();

// Robust Resend Initialization
let resend = null;
if (RESEND_API_KEY) {
  try {
    resend = new Resend(RESEND_API_KEY);
    const keyPrefix = RESEND_API_KEY.substring(0, 7);
    console.log(`📧 [RESEND-INIT] Service Initialized with sanitized key prefix: ${keyPrefix}...`);
  } catch (err) {
    console.error("🔥 [RESEND-INIT] FATAL ERROR during initialization:", err.message);
  }
} else {
  console.warn("⚠️ [RESEND-INIT] RESEND_API_KEY is missing from environment variables");
}

export const verifyMailConnection = async () => {
  if (!RESEND_API_KEY) return false;
  if (!resend) return false;
  return RESEND_API_KEY.startsWith('re_');
};

export const getResendDiagnostics = () => {
  return {
    key_exists: !!RESEND_API_KEY,
    key_raw_length: rawKey.length,
    key_sanitized_length: RESEND_API_KEY.length,
    key_prefix: RESEND_API_KEY ? RESEND_API_KEY.substring(0, 7) : 'NONE',
    initialized: !!resend,
    bypass_active: process.env.BYPASS_OTP === 'true'
  };
};

export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isBypass = process.env.BYPASS_OTP === 'true' && !isProduction;
  
  // ALWAYS log the OTP to the backend console/Railway logs for non-production environments.
  // This allows developers to see the code without needing a verified Resend domain.
  if (!isProduction) {
    console.log("-----------------------------------------");
    console.log(`🔐 [AUTH-TEST-LOG] Generated OTP for ${email}: ${otp}`);
    console.log(`📌 Purpose: ${purpose}`);
    console.log("-----------------------------------------");
  }

  if (isBypass) {
    console.log(`⚠️ [RESEND-BYPASS] Skipping actual email send for ${email} (OTP: ${otp})`);
    return true;
  }

  const subject = purpose === 'verification' ? 'Email Verification - VoiceCast' : 'Password Reset - VoiceCast';
  const text = purpose === 'verification' 
    ? `Your verification code is: ${otp}. This code will expire in 10 minutes.`
    : `Your password reset code is: ${otp}. This code will expire in 10 minutes.`;

  try {
    console.log(`📧 [RESEND-SEND] Sending ${purpose} OTP to: ${email}`);
    
    if (!resend) {
      throw new Error("Resend client not initialized. Check RESEND_API_KEY.");
    }

    const { data, error } = await resend.emails.send({
      from: 'VoiceCast <onboarding@resend.dev>',
      to: [email.trim()],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error(`❌ [RESEND-API-ERROR] Failed to send to ${email}:`, error);
      throw new Error(`Resend API Failure: ${error.message}`);
    }

    console.log(`✅ [RESEND-SUCCESS] Email sent. ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error(`❌ [RESEND-FATAL] Error in email pipeline:`, error.message);
    throw error;
  }
};
