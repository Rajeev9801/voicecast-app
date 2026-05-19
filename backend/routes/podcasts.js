import express from 'express';
import multer from 'multer';
import path from 'path';
import Podcast from '../models/Podcast.js';
import { protect, admin, authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get all podcasts
router.get('/', async (req, res) => {
  try {
    const podcasts = await Podcast.find({ isPublic: true });
    res.json({ podcasts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search podcasts
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const podcasts = await Podcast.find({
      isPublic: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    res.json({ podcasts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trending podcasts
router.get('/trending', async (req, res) => {
  try {
    const podcasts = await Podcast.find({ isPublic: true }).sort({ listens: -1 }).limit(10);
    res.json({ podcasts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's podcasts
router.get('/user/my-podcasts', authenticate, async (req, res) => {
  try {
    const podcasts = await Podcast.find({ uploadedBy: req.userId });
    res.json({ podcasts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload podcast (user)
router.post('/upload', authenticate, upload.fields([{ name: 'audio' }, { name: 'image' }]), async (req, res) => {
  try {
    const { title, description, author, category } = req.body;

    if (!title || !req.files.audio) {
      return res.status(400).json({ error: 'Title and audio file required' });
    }

    const podcast = new Podcast({
      id: Date.now().toString(),
      title,
      description,
      author,
      category,
      audio: req.files.audio[0].path,
      image: req.files.image ? req.files.image[0].path : null,
      uploadedBy: req.userId,
      isPublic: true
    });

    await podcast.save();
    res.json({ podcast, message: 'Podcast uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete podcast (admin or owner)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    if (podcast.uploadedBy.toString() !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Podcast.findByIdAndDelete(req.params.id);
    res.json({ message: 'Podcast deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit podcast
router.put('/:id', authenticate, async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    if (podcast.uploadedBy.toString() !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, description, author, category } = req.body;
    if (title) podcast.title = title;
    if (description) podcast.description = description;
    if (author) podcast.author = author;
    if (category) podcast.category = category;

    await podcast.save();
    res.json({ podcast, message: 'Podcast updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
