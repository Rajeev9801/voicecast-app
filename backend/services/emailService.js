import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dotenv is loaded from the correct location (backend root)
dotenv.config({ path: path.join(__dirname, '../.env') });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Only initialize Resend if API key is present to prevent startup crashes
let resend = null;
if (RESEND_API_KEY) {
  try {
    resend = new Resend(RESEND_API_KEY);
    console.log("📧 [RESEND-INIT] Resend Service Initialized");
  } catch (err) {
    console.error("🔥 [RESEND-INIT] Failed to initialize Resend:", err.message);
  }
}

console.log("-----------------------------------------");
console.log("📧 [RESEND-INIT] API Key Status:", RESEND_API_KEY ? "CONFIGURED" : "MISSING");
console.log("-----------------------------------------");

// Verify connection configuration
export const verifyMailConnection = async () => {
  try {
    if (!RESEND_API_KEY || !resend) {
      console.error("❌ [RESEND-VERIFY] FAILED - RESEND_API_KEY is missing or invalid");
      return false;
    }
    // Simple check: Resend keys typically start with re_
    if (RESEND_API_KEY.startsWith('re_')) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const subject = purpose === 'verification' ? 'Email Verification - VoiceCast' : 'Password Reset - VoiceCast';
  const text = purpose === 'verification' 
    ? `Your verification code is: ${otp}. This code will expire in 10 minutes.`
    : `Your password reset code is: ${otp}. This code will expire in 10 minutes.`;

  try {
    console.log(`📧 [RESEND-SEND] Attempting to send ${purpose} OTP to: ${email}`);
    
    if (!RESEND_API_KEY || !resend) {
      throw new Error("RESEND_API_KEY is not configured or Resend service failed to initialize.");
    }

    const { data, error } = await resend.emails.send({
      from: 'VoiceCast <onboarding@resend.dev>',
      to: [email],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error(`❌ [RESEND-FAILED] Error sending ${purpose} email to ${email}`);
      console.error("   Error Message:", error.message);
      throw new Error(`Resend API Failure: ${error.message}`);
    }

    console.log(`✅ [RESEND-SUCCESS] Email sent to ${email}. ID: ${data.id}`);
    return true;
  } catch (error) {
    console.error(`❌ [RESEND-FAILED] Critical error in email service`);
    console.error("   Error Message:", error.message);
    throw new Error(`Email Service Failure: ${error.message}`);
  }
};
