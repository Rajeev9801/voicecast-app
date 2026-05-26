import api from '../api';

const getStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    return defaultValue;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage error:', err);
  }
};

export const userService = {
  // Profile
  getProfile: async () => {
    try {
      const { data } = await api.get('/api/auth/profile');
      return data.success ? data.data : data;
    } catch (err) {
      // Return null instead of mock Guest to trigger login redirect
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await api.put('/api/auth/profile', profileData);
      const updated = data.success ? data.data : data;
      setStorageItem("voicecast_user", updated);
      return updated;
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  },

  // Likes
  toggleLike: async (podcastId) => {
    try {
      const { data } = await api.post('/api/auth/like', { podcastId });
      return data.success ? data.data : data;
    } catch (err) {
      console.error('Toggle like error:', err);
      throw err;
    }
  },

  // Playlists
  getPlaylists: async () => {
    try {
      const { data } = await api.get('/api/playlists');
      const playlists = data.success ? data.data : data;
      return Array.isArray(playlists) ? playlists : [];
    } catch (err) {
      console.error('Get playlists error:', err);
      return [];
    }
  },

  createPlaylist: async (name) => {
    try {
      const { data } = await api.post('/api/playlists', { name });
      return data.success ? data.data : data;
    } catch (err) {
      console.error('Create playlist error:', err);
      throw err;
    }
  },

  addToPlaylist: async (playlistId, podcastId) => {
    try {
      const { data } = await api.post(`/api/playlists/${playlistId}/add`, { podcastId });
      return data.success ? data.data : data;
    } catch (err) {
      console.error('Add to playlist error:', err);
      throw err;
    }
  },

  removeFromPlaylist: async (playlistId, podcastId) => {
    try {
      const { data } = await api.post(`/api/playlists/${playlistId}/remove`, { podcastId });
      return data.success ? data.data : data;
    } catch (err) {
      console.error('Remove from playlist error:', err);
      throw err;
    }
  },

  deletePlaylist: async (playlistId) => {
    try {
      const { data } = await api.delete(`/api/playlists/${playlistId}`);
      return data.success ? data.data : data;
    } catch (err) {
      console.error('Delete playlist error:', err);
      throw err;
    }
  },

  saveRecording: async (formData) => {
    try {
      console.log("💾 [USER-SERVICE] Sending POST to /api/recordings/save");
      const { data } = await api.post('/api/recordings/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.success ? data.data : data;
    } catch (err) {
      console.error('💾 [USER-SERVICE] API Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // History
  getHistory: async () => {
    try {
      const { data } = await api.get('/api/auth/history');
      const history = data.success ? data.data : data;
      return Array.isArray(history) ? history : [];
    } catch (err) {
      console.error('Get history error:', err);
      return [];
    }
  },

  addToHistory: async (podcastId) => {
    try {
      const { data } = await api.post('/api/auth/history', { podcastId });
      return data.success ? data.data : data;
    } catch (err) {
      console.error('Add to history error:', err);
      throw err;
    }
  },

  // Admin User Management
  getAllUsersAdmin: async () => {
    try {
      const { data } = await api.get('/api/admin/users');
      const users = data.success ? data.data : data;
      return Array.isArray(users) ? users : [];
    } catch (err) {
      console.error('API Error fetching admin users:', err);
      return [];
    }
  },

  deleteUserAdmin: async (id) => {
    try {
      const { data } = await api.delete(`/api/admin/users/${id}`);
      return data.success ? data.data : data;
    } catch (err) {
      console.error('API Error deleting user:', err);
      throw err;
    }
  },

  updateUserRoleAdmin: async (id, role) => {
    try {
      const { data } = await api.patch(`/api/admin/users/${id}/role`, { role });
      return data.success ? data.data : data;
    } catch (err) {
      console.error('API Error updating role:', err);
      throw err;
    }
  },

  // Admin Analytics
  getAnalytics: async () => {
    try {
      const { data } = await api.get('/api/admin/analytics');
      return data.success ? data.data : data;
    } catch (err) {
      console.error('API Error getting analytics:', err);
      return null;
    }
  },

  getStatsAdmin: async () => {
    try {
      const { data } = await api.get('/api/admin/stats');
      return data.success ? data.data : data;
    } catch (err) {
      console.error('API Error getting stats:', err);
      return { totalUsers: 0, totalArtists: 0, totalPodcasts: 0, recentUsers: [] };
    }
  },

  getCreatorStats: async () => {
    try {
      const { data } = await api.get('/api/podcasts/creator-stats');
      return data.success ? data.data : data;
    } catch (err) {
      console.error('API Error getting creator stats:', err);
      return { totalPodcasts: 0, totalPlays: 0, totalFollowers: 0 };
    }
  },

  // Admin Podcast Management
  getAllPodcastsAdmin: async () => {
    try {
      const { data } = await api.get('/api/admin/podcasts');
      const podcasts = data.success ? data.data : data;
      return Array.isArray(podcasts) ? podcasts : [];
    } catch (err) {
      console.error('API Error fetching podcasts admin:', err);
      return [];
    }
  },

  deletePodcastAdmin: async (id) => {
    try {
      const { data } = await api.delete(`/api/admin/podcasts/${id}`);
      return data.success ? data.data : data;
    } catch (err) {
      console.error('API Error deleting podcast:', err);
      throw err;
    }
  },

  // Admin Recording Management
  getAllRecordingsAdmin: async () => {
    try {
      const { data } = await api.get('/api/admin/recordings');
      const recordings = data.success ? data.data : data;
      return Array.isArray(recordings) ? recordings : [];
    } catch (err) {
      console.error('API Error fetching recordings admin:', err);
      return [];
    }
  },

  deleteRecordingAdmin: async (id) => {
    try {
      const { data } = await api.delete(`/api/admin/recordings/${id}`);
      return data.success ? data.data : data;
    } catch (err) {
      console.error('API Error deleting recording:', err);
      throw err;
    }
  }
};
