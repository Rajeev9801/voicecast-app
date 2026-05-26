import User from '../models/User.js';
import Artist from '../models/Artist.js';
import Podcast from '../models/Podcast.js';
import Recording from '../models/Recording.js';

// @desc    Upload a recording
// @route   POST /api/recordings/upload
// @access  Private
export const uploadRecording = async (req, res) => {
  try {
    console.log("\n==== [RECORDING-TRACE] START ====");
    console.log("HEADERS:", req.headers);
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user ? { id: req.user._id, role: req.user.role } : 'UNDEFINED');

    if (!req.file) {
      console.warn("❌ [RECORDING-TRACE] FAILED: No file in request");
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.user) {
      console.warn("❌ [RECORDING-TRACE] FAILED: req.user is missing. Auth failed?");
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title } = req.body;
    const url = `/uploads/${req.file.filename}`;

    // 1. Save to main Recording collection
    const recording = new Recording({
      title: title || 'Untitled Recording',
      audioUrl: url,
      artist: req.user.name || 'VoiceCast Creator',
      uploadedBy: req.user._id,
      onModel: req.user.role === 'artist' || req.user.role === 'podcaster' ? 'Artist' : 'User'
    });
    await recording.save();
    console.log("✅ [RECORDING-TRACE] Saved to Recording model");

    // 2. Add to user/artist sub-array for backward compatibility
    const user = req.user;
    if (!user.recordings) user.recordings = [];
    
    const newRecordingEntry = {
      _id: recording._id,
      title: title || 'Untitled Recording',
      url,
      createdAt: new Date()
    };
    
    user.recordings.push(newRecordingEntry);
    await user.save();
    console.log(`✅ [RECORDING-TRACE] Updated ${user.role} profile array`);

    // 3. Create a Podcast document so it appears on the homepage
    const podcast = new Podcast({
      id: Date.now().toString(),
      title: title || 'Untitled Recording',
      description: 'Captured in Recording Studio',
      author: user.name || 'VoiceCast Creator',
      audio: url,
      image: '',
      uploadedBy: user._id,
      on: user._id,
      onModel: user.role === 'admin' ? 'User' : 
               user.role === 'artist' ? 'Artist' : 'User',
      isPublic: true
    });
    await podcast.save();
    console.log("✅ [RECORDING-TRACE] Created Podcast entry");

    res.status(201).json({
      message: 'Recording uploaded successfully',
      recording: newRecordingEntry,
      podcast
    });
    console.log("==== [RECORDING-TRACE] END SUCCESS ====\n");
  } catch (error) {
    console.error("🔥 [RECORDING-TRACE] CRITICAL ERROR:", error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
};

// @desc    Get user's recordings
// @route   GET /api/recordings
// @access  Private
export const getMyRecordings = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.recordings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a recording
// @route   DELETE /api/recordings/:id
// @access  Private
export const deleteRecording = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from profile sub-array
    user.recordings = user.recordings.filter(
      (rec) => rec._id.toString() !== req.params.id
    );
    await user.save();

    // Remove from main Recording collection
    await Recording.deleteOne({ _id: req.params.id });

    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

