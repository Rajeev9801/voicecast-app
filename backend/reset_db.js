import mongoose from 'mongoose';
import User from './models/User.js';
import Artist from './models/Artist.js';
import Podcast from './models/Podcast.js';
import 'dotenv/config';

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/voicecast';

async function resetDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    console.log('Deleting Users...');
    await User.deleteMany({});
    
    console.log('Deleting Artists...');
    await Artist.deleteMany({});
    
    console.log('Deleting Podcasts...');
    await Podcast.deleteMany({});

    console.log('✅ Database reset complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during reset:', err);
    process.exit(1);
  }
}

resetDB();
