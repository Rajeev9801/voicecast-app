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
      return data;
    } catch (err) {
      // Return null instead of mock Guest to trigger login redirect
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await api.put('/api/auth/profile', profileData);
      setStorageItem("voicecast_user", data);
      return data;
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  },

  // Likes
  toggleLike: async (podcastId) => {
    try {
      const { data } = await api.post('/api/auth/like', { podcastId });
      return data;
    } catch (err) {
      console.error('Toggle like error:', err);
      throw err;
    }
  },

  // Playlists
  getPlaylists: async () => {
    try {
      const { data } = await api.get('/api/auth/playlists');
      return data;
    } catch (err) {
      console.error('Get playlists error:', err);
      throw err;
    }
  },

  createPlaylist: async (name) => {
    try {
      const { data } = await api.post('/api/auth/playlists', { name });
      return data;
    } catch (err) {
      console.error('Create playlist error:', err);
      throw err;
    }
  },

  addToPlaylist: async (playlistId, podcastId) => {
    try {
      const { data } = await api.post(`/api/auth/playlists/${playlistId}/add`, { podcastId });
      return data;
    } catch (err) {
      console.error('Add to playlist error:', err);
      throw err;
    }
  },

  removeFromPlaylist: async (playlistId, podcastId) => {
    try {
      const { data } = await api.delete(`/api/auth/playlists/${playlistId}`);
      return data;
    } catch (err) {
      console.error('Remove from playlist error:', err);
      throw err;
    }
  },

  deletePlaylist: async (playlistId) => {
    try {
      const { data } = await api.delete(`/api/auth/playlists/${playlistId}`);
      return data;
    } catch (err) {
      console.error('Delete playlist error:', err);
      throw err;
    }
  },

  // History
  getHistory: async () => {
    try {
      const { data } = await api.get('/api/auth/history');
      return data;
    } catch (err) {
      console.error('Get history error:', err);
      throw err;
    }
  },

  addToHistory: async (podcastId) => {
    try {
      const { data } = await api.post('/api/auth/history', { podcastId });
      return data;
    } catch (err) {
      console.error('Add to history error:', err);
      throw err;
    }
  },

  // Admin User Management
  getAllUsersAdmin: async () => {
    try {
      const { data } = await api.get('/api/admin/users');
      return data || [];
    } catch (err) {
      console.error('API Error fetching admin users:', err);
      throw err;
    }
  },

  deleteUserAdmin: async (id) => {
    try {
      const { data } = await api.delete(`/api/admin/users/${id}`);
      return data;
    } catch (err) {
      console.error('API Error deleting user:', err);
      throw err;
    }
  },

  updateUserRoleAdmin: async (id, role) => {
    try {
      const { data } = await api.patch(`/api/admin/users/${id}/role`, { role });
      return data;
    } catch (err) {
      console.error('API Error updating role:', err);
      throw err;
    }
  },

  // Admin Analytics
  getAnalytics: async () => {
    try {
      const { data } = await api.get('/api/admin/analytics');
      return data;
    } catch (err) {
      console.error('API Error getting analytics:', err);
      throw err;
    }
  },

  // Admin Podcast Management
  getAllPodcastsAdmin: async () => {
    try {
      const { data } = await api.get('/api/admin/podcasts');
      return data || [];
    } catch (err) {
      console.error('API Error fetching podcasts admin:', err);
      throw err;
    }
  },

  deletePodcastAdmin: async (id) => {
    try {
      const { data } = await api.delete(`/api/admin/podcasts/${id}`);
      return data;
    } catch (err) {
      console.error('API Error deleting podcast:', err);
      throw err;
    }
  },

  // Admin Recording Management
  getAllRecordingsAdmin: async () => {
    try {
      const { data } = await api.get('/api/admin/recordings');
      return data || [];
    } catch (err) {
      console.error('API Error fetching recordings admin:', err);
      throw err;
    }
  },

  deleteRecordingAdmin: async (id) => {
    try {
      const { data } = await api.delete(`/api/admin/recordings/${id}`);
      return data;
    } catch (err) {
      console.error('API Error deleting recording:', err);
      throw err;
    }
  }
};
