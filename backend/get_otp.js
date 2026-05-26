import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/voicecast';

async function getOTP() {
  try {
    await mongoose.connect(mongoURI);
    const user = await User.findOne({ email: 'test@example.com' });
    console.log('OTP for test@example.com:', user.otp);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

getOTP();
