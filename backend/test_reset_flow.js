import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/voicecast';

async function testResetFlow() {
  try {
    // 1. Forgot Password
    console.log('--- 1. Forgot Password ---');
    await axios.post('http://127.0.0.1:5000/api/auth/forgot-password', {
      email: 'test@example.com'
    });
    
    // 2. Get OTP from DB
    console.log('--- 2. Getting OTP ---');
    await mongoose.connect(mongoURI);
    const user = await User.findOne({ email: 'test@example.com' });
    const otp = user.resetPasswordOTP;
    console.log('Reset OTP:', otp);
    await mongoose.disconnect();

    // 3. Reset Password
    console.log('--- 3. Resetting Password ---');
    await axios.post('http://127.0.0.1:5000/api/auth/reset-password', {
      email: 'test@example.com',
      otp: otp,
      newPassword: 'newpassword123'
    });

    // 4. Login with new password
    console.log('--- 4. Logging in with NEW password ---');
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login/user', {
      email: 'test@example.com',
      password: 'newpassword123'
    });
    console.log('Login Response:', loginRes.data);

  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testResetFlow();
