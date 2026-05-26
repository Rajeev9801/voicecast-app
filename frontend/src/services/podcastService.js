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
      return data.podcasts || data;
    } catch (err) {
      console.error('Failed to fetch podcasts', err);
      return [];
    }
  },

  getTrending: async () => {
    try {
      const { data } = await api.get('/api/podcasts/trending');
      return data.podcasts || data;
    } catch (err) {
      console.error('Failed to fetch trending', err);
      return [];
    }
  },

  getMyPodcasts: async () => {
    const { data } = await api.get('/api/podcasts/my');
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/api/podcasts/${id}`);
    return data;
  },

  search: async (query) => {
    try {
      const { data } = await api.get(`/api/podcasts/search/${query}`);
      return data;
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
      return data;
    } catch (err) {
      return podcastService.search(query);
    }
  },

  searchGlobal: async (query) => {
    try {
      const { data } = await api.get(`/api/podcasts/global/search?query=${query}`);
      return data;
    } catch (err) {
      return podcastService.search(query);
    }
  },

  getFeedEpisodes: async (feedUrl) => {
    const { data } = await api.get(`/api/podcasts/global/episodes?feedUrl=${feedUrl}`);
    return data;
  },

  getEpisodes: async (podcastId) => {
    const { data } = await api.get(`/api/podcasts/${podcastId}/episodes`);
    return data;
  },
};
