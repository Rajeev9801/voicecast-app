import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/voicecast';

async function cleanupUsers() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Identify users to keep:
    // 1. Admins
    // 2. Users created recently (e.g., in the last 2 days) - should cover "mohan"
    // 3. Any user with actual recordings
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result = await User.deleteMany({
      role: { $ne: 'admin' },
      createdAt: { $lt: twoDaysAgo },
      recordings: { $size: 0 }
    });

    console.log(`Cleaned up ${result.deletedCount} old/demo users.`);

    // Specifically remove any user with 'mock' or 'demo' in their name/email if they aren't admin
    const result2 = await User.deleteMany({
      role: { $ne: 'admin' },
      $or: [
        { name: /mock/i },
        { name: /demo/i },
        { email: /mock/i },
        { email: /demo/i }
      ]
    });

    console.log(`Removed ${result2.deletedCount} additional mock/demo accounts.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanupUsers();
