import User from '../models/User.js';
import Podcast from '../models/Podcast.js';

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPodcasts = await Podcast.countDocuments();
    
    const allUsers = await User.find({});
    const totalRecordings = allUsers.reduce((acc, user) => acc + (user.recordings?.length || 0), 0);
    
    const totalCreators = await User.countDocuments({ 
      $or: [
        { role: 'podcaster' },
        { recordings: { $exists: true, $not: { $size: 0 } } }
      ] 
    });

    const podcasts = await Podcast.find({});
    const totalPlays = podcasts.reduce((acc, p) => acc + (p.listens || 0), 0);

    res.json({
      totalUsers,
      totalPodcasts,
      totalRecordings,
      totalCreators,
      totalPlays
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all podcasts
// @route   GET /api/admin/podcasts
// @access  Private/Admin
export const getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({})
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(podcasts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin account' });
    }

    // Delete user's podcasts first
    await Podcast.deleteMany({ uploadedBy: user._id });
    
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User and their content removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin' && role !== 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(400).json({ message: 'Cannot demote the only admin' });
        }
      }
      user.role = role || user.role;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete podcast
// @route   DELETE /api/admin/podcasts/:id
// @access  Private/Admin
export const deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    await Podcast.deleteOne({ _id: podcast._id });
    res.json({ message: 'Podcast removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
