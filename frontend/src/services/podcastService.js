import api from '../api';

export const podcastService = {
  createPodcast: async (formData) => {
    const { data } = await api.post('/api/podcasts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  getRecommended: async () => {
    try {
      const { data } = await api.get('/api/podcasts');
      const podcasts = data.success ? data.data : (data.podcasts || data);
      return Array.isArray(podcasts) ? podcasts : [];
    } catch (err) {
      console.error('Failed to fetch podcasts', err);
      return [];
    }
  },

  getTrending: async () => {
    try {
      const { data } = await api.get('/api/podcasts/trending');
      const trending = data.success ? data.data : (data.podcasts || data);
      return Array.isArray(trending) ? trending : [];
    } catch (err) {
      console.error('Failed to fetch trending', err);
      return [];
    }
  },

  getMyPodcasts: async () => {
    try {
      const { data } = await api.get('/api/podcasts/my');
      const my = data.success ? data.data : data;
      return Array.isArray(my) ? my : [];
    } catch (err) {
      console.error('Failed to fetch my podcasts', err);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const { data } = await api.get(`/api/podcasts/${id}`);
      return data.success ? data.data : data;
    } catch (err) {
      console.error('Failed to fetch podcast by id', err);
      return null;
    }
  },

  search: async (query) => {
    try {
      const { data } = await api.get(`/api/podcasts/search/${query}`);
      const results = data.success ? data.data : data;
      return Array.isArray(results) ? results : [];
    } catch (err) {
      console.error('Search failed', err);
      return [];
    }
  },

  deletePodcast: async (podcastId) => {
    const { data } = await api.delete(`/api/podcasts/${podcastId}`);
    return data;
  },

  // These might still be used by some pages
  searchSpotify: async (query) => {
    try {
      const { data } = await api.get(`/api/podcasts/spotify/search?query=${query}`);
      const results = data.success ? data.data : data;
      return Array.isArray(results) ? results : podcastService.search(query);
    } catch (err) {
      return podcastService.search(query);
    }
  },

  searchGlobal: async (query) => {
    try {
      const { data } = await api.get(`/api/podcasts/global/search?query=${query}`);
      const results = data.success ? data.data : data;
      return Array.isArray(results) ? results : podcastService.search(query);
    } catch (err) {
      return podcastService.search(query);
    }
  },

  getFeedEpisodes: async (feedUrl) => {
    try {
      const { data } = await api.get(`/api/podcasts/global/episodes?feedUrl=${feedUrl}`);
      const results = data.success ? data.data : data;
      return Array.isArray(results) ? results : [];
    } catch (err) {
      console.error('Failed to fetch feed episodes', err);
      return [];
    }
  },

  getEpisodes: async (podcastId) => {
    try {
      const { data } = await api.get(`/api/podcasts/${podcastId}/episodes`);
      const results = data.success ? data.data : data;
      return Array.isArray(results) ? results : [];
    } catch (err) {
      console.error('Failed to fetch episodes', err);
      return [];
    }
  },
};
