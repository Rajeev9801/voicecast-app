import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Artist from './models/Artist.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/voicecast';

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for seeding');

    // Create User test account
    const userEmail = 'testuser@example.com';
    await User.deleteOne({ email: userEmail });
    await User.create({
      name: 'Test User',
      email: userEmail,
      password: 'password123',
      role: 'user',
      isVerified: true
    });
    console.log(`👤 Created Test User: ${userEmail} / password123`);

    // Create Artist test account
    const artistEmail = 'testartist@example.com';
    await Artist.deleteOne({ email: artistEmail });
    await Artist.create({
      name: 'Test Artist',
      email: artistEmail,
      password: 'password123',
      role: 'artist',
      isVerified: true
    });
    console.log(`🎨 Created Test Artist: ${artistEmail} / password123`);

    await mongoose.disconnect();
    console.log('✅ Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
