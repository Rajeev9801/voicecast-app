import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import podcastRoutes from './routes/podcastRoutes.js';
import recordingRoutes from './routes/recordingRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
const tempDir = path.join(uploadDir, 'temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Reflect exactly the requesting origin to support dynamic Vercel deployments
    callback(null, origin || true);
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Connect MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/voicecast';
mongoose.connect(mongoURI)
.then(async () => {
  console.log('✅ MongoDB connected');
  try {
    const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.collection('users').dropIndex('username_1').catch(err => {
        // Index might not exist, ignore
      });
    }
  } catch (err) {
    console.log('Index drop info:', err.message);
  }
})
.catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.send('Voicecast API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
