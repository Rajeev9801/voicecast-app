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
      const user = await userService.getProfile();
      const updatedUser = { ...user, ...profileData };
      setStorageItem("voicecast_user", updatedUser);
      return updatedUser;
    }
  },

  // Likes
  toggleLike: async (podcastId) => {
    try {
      const { data } = await api.post('/api/auth/like', { podcastId });
      return data;
    } catch (err) {
      const user = await userService.getProfile();
      const likedSongs = user.likedSongs || [];
      const index = likedSongs.indexOf(podcastId);
      if (index > -1) {
        likedSongs.splice(index, 1);
      } else {
        likedSongs.push(podcastId);
      }
      const updatedUser = { ...user, likedSongs };
      setStorageItem("voicecast_user", updatedUser);
      return { likedSongs };
    }
  },

  // Playlists
  getPlaylists: async () => {
    try {
      const { data } = await api.get('/api/auth/playlists');
      return data;
    } catch (err) {
      return getStorageItem("voicecast_playlists", []);
    }
  },

  createPlaylist: async (name) => {
    try {
      const { data } = await api.post('/api/auth/playlists', { name });
      return data;
    } catch (err) {
      const playlists = await userService.getPlaylists();
      const newPlaylist = { _id: Date.now().toString(), name, recordings: [] };
      const updatedPlaylists = [...playlists, newPlaylist];
      setStorageItem("voicecast_playlists", updatedPlaylists);
      return newPlaylist;
    }
  },

  addToPlaylist: async (playlistId, podcastId) => {
    try {
      // Find playlist name first if needed, or update API to use ID
      const { data } = await api.post(`/api/auth/playlists/${playlistId}/add`, { podcastId });
      return data;
    } catch (err) {
      const playlists = await userService.getPlaylists();
      const updatedPlaylists = playlists.map(pl => {
        if (pl._id === playlistId) {
          return { ...pl, recordings: [...(pl.recordings || []), podcastId] };
        }
        return pl;
      });
      setStorageItem("voicecast_playlists", updatedPlaylists);
      return { success: true };
    }
  },

  removeFromPlaylist: async (playlistId, podcastId) => {
    try {
      const { data } = await api.delete(`/api/auth/playlists/${playlistId}`);
      return data;
    } catch (err) {
      const playlists = await userService.getPlaylists();
      const updatedPlaylists = playlists.map(pl => {
        if (pl._id === playlistId) {
          return { ...pl, recordings: (pl.recordings || []).filter(id => id !== podcastId) };
        }
        return pl;
      });
      setStorageItem("voicecast_playlists", updatedPlaylists);
      return { success: true };
    }
  },

  deletePlaylist: async (playlistId) => {
    try {
      const { data } = await api.delete(`/api/auth/playlists/${playlistId}`);
      return data;
    } catch (err) {
      const playlists = await userService.getPlaylists();
      const updatedPlaylists = playlists.filter(pl => pl._id !== playlistId);
      setStorageItem("voicecast_playlists", updatedPlaylists);
      return { success: true };
    }
  },

  // History
  getHistory: async () => {
    try {
      const { data } = await api.get('/api/auth/history');
      return data;
    } catch (err) {
      const history = getStorageItem("voicecast_history", []);
      return { history };
    }
  },

  addToHistory: async (podcastId) => {
    try {
      const { data } = await api.post('/api/auth/history', { podcastId });
      return data;
    } catch (err) {
      const history = getStorageItem("voicecast_history", []);
      const newEntry = { podcast: { _id: podcastId, title: 'Mock Recording', author: 'VoiceCast' }, listenedAt: new Date().toISOString() };
      const updatedHistory = [newEntry, ...history].slice(0, 20);
      setStorageItem("voicecast_history", updatedHistory);
      return { success: true };
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
