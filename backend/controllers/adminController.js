import User from '../models/User.js';
import Artist from '../models/Artist.js';
import Podcast from '../models/Podcast.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    console.log("📊 [ADMIN-STATS] Fetching real-time dashboard data...");
    
    // 1. Core Counts
    const totalUsers = await User.countDocuments();
    const totalArtists = await Artist.countDocuments();
    const totalPodcasts = await Podcast.countDocuments();

    // 2. Growth Data Helper
    const getGrowthData = async (Model, countKey) => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      const result = await Model.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return result.map(d => ({
        month: months[d._id.month - 1],
        [countKey]: d.count
      }));
    };

    const userGrowthData = await getGrowthData(User, 'users');
    const artistGrowthData = await getGrowthData(Artist, 'artists');
    const podcastGrowthData = await getGrowthData(Podcast, 'podcasts');

    // 3. Category Distribution
    const categoryResult = await Podcast.aggregate([
      {
        $group: {
          _id: "$category",
          value: { $sum: 1 }
        }
      }
    ]);

    const categoryData = categoryResult.map(item => ({
      name: item._id || 'General',
      value: item.value
    }));

    // 4. Recent Arrivals
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(6);

    const response = {
      success: true,
      totalUsers,
      totalArtists,
      totalPodcasts,
      userGrowthData: userGrowthData.length > 0 ? userGrowthData : [{ month: 'May', users: totalUsers }],
      artistGrowthData: artistGrowthData.length > 0 ? artistGrowthData : [{ month: 'May', artists: totalArtists }],
      podcastGrowthData: podcastGrowthData.length > 0 ? podcastGrowthData : [{ month: 'May', podcasts: totalPodcasts }],
      categoryData: categoryData.length > 0 ? categoryData : [{ name: 'Other', value: 0 }],
      recentUsers
    };

    console.log("✅ [ADMIN-STATS] Response prepared:", {
      users: response.totalUsers,
      artists: response.totalArtists,
      podcasts: response.totalPodcasts,
      recent: response.recentUsers.length
    });

    res.json(response);
  } catch (error) {
    console.error("🔥 [ADMIN-STATS] ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalArtists = await Artist.countDocuments();
    const totalPodcasts = await Podcast.countDocuments();
    
    const allUsers = await User.find({});
    const allArtists = await Artist.find({});
    
    const totalRecordings = 
      allUsers.reduce((acc, user) => acc + (user.recordings?.length || 0), 0) +
      allArtists.reduce((acc, artist) => acc + (artist.recordings?.length || 0), 0);
    
    const totalCreators = totalArtists + await User.countDocuments({ 
      recordings: { $exists: true, $not: { $size: 0 } }
    });

    const podcasts = await Podcast.find({});
    const totalPlays = podcasts.reduce((acc, p) => acc + (p.listens || 0), 0);

    res.json({
      totalUsers: totalUsers + totalArtists,
      totalPodcasts,
      totalRecordings,
      totalCreators,
      totalPlays
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (includes artists for dashboard)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    const artists = await Artist.find({}).select('-password').sort({ createdAt: -1 });
    
    // Combine and sort by createdAt
    const combined = [...users, ...artists].sort((a, b) => b.createdAt - a.createdAt);
    res.json(combined);
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

// @desc    Delete user or artist
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    let Model = User;
    
    if (!user) {
      user = await Artist.findById(req.params.id);
      Model = Artist;
    }

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin account' });
    }

    // Delete user's podcasts first
    await Podcast.deleteMany({ uploadedBy: user._id });
    
    await Model.deleteOne({ _id: user._id });
    res.json({ message: 'Account and their content removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user or artist role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    let user = await User.findById(req.params.id);
    
    if (!user) {
      user = await Artist.findById(req.params.id);
    }

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
      res.status(404).json({ message: 'Account not found' });
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
