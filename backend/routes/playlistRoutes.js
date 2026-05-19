import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all playlists of the user
// @route   GET /api/playlists
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('playlists.podcasts');
    res.json(user.playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a new playlist
// @route   POST /api/playlists
router.post('/', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Playlist name is required' });

    const user = await User.findById(req.user._id);
    user.playlists.push({ name, podcasts: [] });
    await user.save();
    res.status(201).json(user.playlists[user.playlists.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.playlists = user.playlists.filter(p => p._id.toString() !== req.params.id);
    await user.save();
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Add podcast to playlist
// @route   POST /api/playlists/:id/add
router.post('/:id/add', protect, async (req, res) => {
  try {
    const { podcastId } = req.body;
    const user = await User.findById(req.user._id);
    const playlist = user.playlists.id(req.params.id);
    
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    
    if (playlist.podcasts.includes(podcastId)) {
        return res.status(400).json({ message: 'Already in playlist' });
    }

    playlist.podcasts.push(podcastId);
    await user.save();
    res.json({ message: 'Added to playlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
