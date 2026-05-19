import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/voicecast';

async function verifyAdmin() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@voicecast.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log('Admin not found. Creating...');
      admin = new User({
        name: 'System Admin',
        email: adminEmail,
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'admin'
      });
      await admin.save();
      console.log('Admin created.');
    } else {
      console.log('Admin found:', {
        id: admin._id,
        email: admin.email,
        role: admin.role
      });
      if (admin.role !== 'admin') {
        console.log('Updating role to admin...');
        admin.role = 'admin';
        await admin.save();
        console.log('Role updated.');
      }
    }

    const finalCheck = await User.findOne({ email: adminEmail });
    console.log('FINAL DB STATE:', {
      email: finalCheck.email,
      role: finalCheck.role
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

verifyAdmin();
