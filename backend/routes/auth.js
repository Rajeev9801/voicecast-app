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
  addToPlaylist,
  forgotPasswordUser,
  resetPasswordUser,
  verifyResetOTP,
  verifyOTP,
  sendOTP,
  requestAdminOTP,
  verifyAdminOTP,
  setAdminPassword
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { verifyMailConnection, getMailDiagnostics } from '../services/emailService.js';
import mongoose from 'mongoose';

const router = express.Router();
console.log("🚦 [AUTH] Routes loading...");

router.get('/diagnostic', async (req, res) => {
  try {
    const diag = getMailDiagnostics();
    const smtpConnected = await verifyMailConnection();
    res.json({
      success: true,
      node_env: diag.node_env,
      mongodb: mongoose.connection.readyState === 1,
      email: {
        provider: diag.provider,
        smtp_connected: smtpConnected,
        user_set: diag.user_set,
        pass_set: diag.pass_set
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/login/:role', authUser);

// Admin specific login/setup routes
router.post('/admin/request-otp', requestAdminOTP);
router.post('/request-admin-otp', requestAdminOTP); // Alias
router.post('/verify-admin-otp', verifyAdminOTP);
router.post('/admin/set-password', setAdminPassword);

// Generic Forgot Password (for users)
router.post('/forgot-password', forgotPasswordUser);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPasswordUser);

// OTP Verification & Retry
router.post('/verify-otp', verifyOTP);
router.post('/send-otp', sendOTP);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// History
router.route('/history')
  .post(protect, addToHistory)
  .get(protect, getHistory);

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
