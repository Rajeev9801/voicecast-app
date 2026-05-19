import User from '../models/User.js';
import Podcast from '../models/Podcast.js';

// @desc    Upload a recording
// @route   POST /api/recordings/upload
// @access  Private
export const uploadRecording = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title } = req.body;
    const url = `/uploads/${req.file.filename}`;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newRecording = {
      title: title || 'Untitled Recording',
      url,
      createdAt: new Date()
    };

    user.recordings.push(newRecording);
    await user.save();

    // Create a Podcast document so it appears on the homepage
    const podcast = new Podcast({
      id: Date.now().toString(),
      title: title || 'Untitled Recording',
      description: 'Recorded via VoiceCast Studio',
      author: user.name || 'VoiceCast Artist',
      audio: url,
      image: '',
      uploadedBy: user._id,
      isPublic: true
    });
    await podcast.save();

    res.status(201).json({
      message: 'Recording uploaded successfully',
      recording: newRecording,
      podcast
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's recordings
// @route   GET /api/recordings
// @access  Private
export const getMyRecordings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.recordings = user.recordings.filter(
      (rec) => rec._id.toString() !== req.params.id
    );
    await user.save();

    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

