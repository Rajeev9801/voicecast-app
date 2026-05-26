import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = "rajeevkumar9801456p@gmail.com";
const SENDER_NAME = "VoiceCast Support";

// Initialize Brevo Client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];

if (BREVO_API_KEY) {
  apiKey.apiKey = BREVO_API_KEY;
  console.log("-----------------------------------------");
  console.log("📧 [MAIL] Brevo initialized");
  console.log("📧 [MAIL] Sender:", SENDER_EMAIL);
  console.log("-----------------------------------------");
} else {
  console.warn("⚠️ [MAIL] BREVO_API_KEY missing from environment");
}

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Maintain interface for server.js compatibility
export const verifyMailConnection = async () => {
  if (!BREVO_API_KEY) {
    console.error("❌ [MAIL-VERIFY] FAILED - BREVO_API_KEY missing");
    return false;
  }
  // Brevo is an API, no persistent connection to verify like SMTP
  console.log("✅ [MAIL-VERIFY] Brevo API Ready");
  return true;
};

export const getMailDiagnostics = () => {
  return {
    provider: 'Brevo (Transactional API)',
    api_key_set: !!BREVO_API_KEY,
    sender: SENDER_EMAIL,
    node_env: process.env.NODE_ENV
  };
};

export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  if (!BREVO_API_KEY) {
    throw new Error("Brevo API Key not configured");
  }

  const subjects = {
    'verification': 'Email Verification - VoiceCast',
    'reset': 'Password Reset - VoiceCast',
    'admin_otp': 'Admin Access Code - VoiceCast',
    'artist_auth': 'Artist Authentication - VoiceCast'
  };

  const subject = subjects[purpose] || 'Verification Code - VoiceCast';
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = `
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
  `;
  sendSmtpEmail.sender = { "name": SENDER_NAME, "email": SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": email.trim() }];

  try {
    console.log(`📧 [MAIL] Sending OTP to: ${email}`);
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ [MAIL] OTP sent successfully. MessageId:", data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("❌ [MAIL-EXCEPTION] Brevo Error:", error.response?.text || error.message);
    
    let detailedError = error.message;
    if (error.response?.text) {
      try {
        const parsed = JSON.parse(error.response.text);
        detailedError = parsed.message || detailedError;
      } catch (e) {}
    }
    
    throw new Error(`Email Delivery Failure (Brevo): ${detailedError}`);
  }
};
