import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';

async function forceAdminReady() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/voicecast';
  await mongoose.connect(mongoURI);
  
  const email = 'rajeevkumar9801456p@gmail.com';
  let admin = await User.findOne({ email });
  
  if (!admin) {
    admin = new User({ email, name: 'Admin', role: 'admin', isVerified: true });
  }
  
  admin.password = 'admin123';
  admin.role = 'admin';
  admin.isVerified = true;
  await admin.save();
  
  console.log("✅ Admin account FORCED to ready state.");
  console.log("Email:", email);
  console.log("Password: admin123");
  
  await mongoose.disconnect();
  process.exit(0);
}

forceAdminReady();
