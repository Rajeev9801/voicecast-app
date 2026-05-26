import axios from 'axios';
import mongoose from 'mongoose';
import Artist from './models/Artist.js';
import 'dotenv/config';

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/voicecast';

async function testArtistFlow() {
  try {
    // 1. Register as Artist
    console.log('--- 1. Register as Artist ---');
    await axios.post('http://127.0.0.1:5000/api/auth/register', {
      name: 'Artist Test',
      email: 'artist@example.com',
      password: 'password123',
      role: 'artist'
    });

    // 2. Get OTP
    console.log('--- 2. Getting OTP ---');
    await mongoose.connect(mongoURI);
    const user = await Artist.findOne({ email: 'artist@example.com' });
    const otp = user.otp;
    console.log('OTP:', otp);
    await mongoose.disconnect();

    // 3. Verify OTP
    console.log('--- 3. Verifying OTP ---');
    await axios.post('http://127.0.0.1:5000/api/auth/verify-otp', {
      email: 'artist@example.com',
      otp: otp
    });

    // 4. Login as Artist
    console.log('--- 4. Logging in as Artist ---');
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login/artist', {
      email: 'artist@example.com',
      password: 'password123',
      role: 'artist'
    });
    console.log('Login Response:', loginRes.data);

  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testArtistFlow();
