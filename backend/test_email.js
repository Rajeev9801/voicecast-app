import { verifyMailConnection, sendOTPEmail } from './services/emailService.js';

async function test() {
  const isConnected = await verifyMailConnection();
  console.log("Connected:", isConnected);
  if (isConnected) {
    const isSent = await sendOTPEmail('test@example.com', '123456');
    console.log("Sent:", isSent);
  }
  process.exit(0);
}
test();