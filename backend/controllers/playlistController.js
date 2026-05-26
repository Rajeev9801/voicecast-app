import Playlist from '../models/Playlist.js';
import User from '../models/User.js';
import Artist from '../models/Artist.js';

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
export const createPlaylist = async (req, res) => {
  try {
    console.log("\n==== [PLAYLIST-CREATE] START ====");
    console.log("BODY:", req.body);
    console.log("USER:", req.user ? { id: req.user._id, role: req.user.role } : 'UNDEFINED');

    const { name } = req.body;

    if (!name) {
      console.warn("❌ [PLAYLIST-CREATE] FAILED: Name missing");
      return res.status(400).json({
        success: false,
        message: "Playlist name is required"
      });
    }

    if (!req.user) {
      console.warn("❌ [PLAYLIST-CREATE] FAILED: req.user missing");
      return res.status(401).json({
        success: false,
        message: "Not authorized"
      });
    }

    const playlist = new Playlist({
      name,
      user: req.user._id,
      onModel: req.user.role === 'artist' || req.user.role === 'podcaster' ? 'Artist' : 'User',
      podcasts: []
    });

    await playlist.save();
    
    // Backward compatibility: add to user's embedded array if needed
    // Note: It's better to use the main collection, but keeping UI sync in mind
    const userObj = req.user;
    if (userObj.playlists) {
        userObj.playlists.push({ _id: playlist._id, name, podcasts: [] });
        await userObj.save();
    }

    console.log("✅ [PLAYLIST-CREATE] SUCCESS:", playlist._id);
    return res.status(201).json({
      success: true,
      playlist
    });
  } catch (err) {
    console.error("🔥 [PLAYLIST-CREATE] ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all playlists of the user
// @route   GET /api/playlists
// @access  Private
export const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id }).populate('podcasts');
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add podcast to playlist
// @route   POST /api/playlists/:id/add
// @access  Private
export const addToPlaylist = async (req, res) => {
    try {
      const { podcastId } = req.body;
      const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user._id });
      
      if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
      
      if (playlist.podcasts.includes(podcastId)) {
          return res.status(400).json({ success: false, message: 'Already in playlist' });
      }
  
      playlist.podcasts.push(podcastId);
      await playlist.save();
      res.json({ success: true, message: 'Added to playlist' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Remove podcast from playlist
// @route   POST /api/playlists/:id/remove
// @access  Private
export const removeFromPlaylist = async (req, res) => {
    try {
      const { podcastId } = req.body;
      const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user._id });
      
      if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
      
      playlist.podcasts = playlist.podcasts.filter(p => p.toString() !== podcastId);
      await playlist.save();
      res.json({ success: true, message: 'Removed from playlist' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
// @access  Private
export const deletePlaylist = async (req, res) => {
    try {
      const result = await Playlist.deleteOne({ _id: req.params.id, user: req.user._id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Playlist not found' });
      }
      res.json({ success: true, message: 'Playlist deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
};
