import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/voicecast');
    const adminEmail = 'rajeevkumar9801456p@gmail.com';
    const db = mongoose.connection.db;
    
    // We must use bcrypt to hash the password since we are using updateOne which bypasses Mongoose pre-save
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.collection('users').updateOne(
      { email: adminEmail },
      { $set: { 
          name: 'System Admin', 
          password: hashedPassword, 
          role: 'admin', 
          isVerified: true 
        } 
      },
      { upsert: true }
    );
    console.log('Admin account upserted');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seedAdmin();