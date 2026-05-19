import express from 'express';
import User from '../models/User.js';
import Podcast from '../models/Podcast.js';
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  addToHistory,
  getHistory,
  createPlaylist,
  addToPlaylist
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// History
router.route('/history')
  .post(protect, addToHistory)
  .get(protect, getHistory);

// Playlists
router.route('/playlists')
  .post(protect, createPlaylist)
  .get(protect, (req, res) => {
    User.findById(req.user._id).then(user => res.json(user.playlists));
  });

router.route('/playlists/:name')
  .delete(protect, (req, res) => {
    User.findById(req.user._id).then(user => {
      user.playlists = user.playlists.filter(p => p.name !== req.params.name);
      user.save().then(() => res.json({ message: 'Playlist deleted' }));
    });
  });

router.post('/playlists/:name/add', protect, addToPlaylist);

// Likes
router.post('/like', protect, async (req, res) => {
  try {
    const { podcastId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.likedSongs) user.likedSongs = [];
    
    const index = user.likedSongs.findIndex(id => id.toString() === podcastId.toString());
    
    if (index === -1) {
      user.likedSongs.push(podcastId);
      await user.save();
      res.json({ message: 'Added to liked songs', liked: true });
    } else {
      user.likedSongs.splice(index, 1);
      await user.save();
      res.json({ message: 'Removed from liked songs', liked: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Analytics
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPodcasts = await Podcast.countDocuments();
    const allUsers = await User.find({});
    const totalRecordings = allUsers.reduce((acc, user) => acc + (user.recordings?.length || 0), 0);
    
    res.json({
      totalUsers, 
      totalPodcasts, 
      totalRecordings 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin routes
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);

export default router;
