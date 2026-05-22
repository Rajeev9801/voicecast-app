import api from '../api';

const MOCK_PODCASTS = [
  { _id: '1', title: 'The Daily Voice', author: 'VoiceCast', category: 'News', duration: '15:00', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop' },
  { _id: '2', title: 'Tech Talk', author: 'Silicon Valley', category: 'Technology', duration: '45:00', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400' },
  { _id: '3', title: 'Mindset Matters', author: 'Growth Co.', category: 'Self-Help', duration: '20:00', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop' },
  { _id: '4', title: 'Creative Minds', author: 'Art Pulse', category: 'Design', duration: '32:00', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400' },
  { _id: '5', title: 'Future Pulse', author: 'Deep Blue', category: 'Science', duration: '28:00', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400' },
];

export const podcastService = {
  createPodcast: async (formData) => {
    const { data } = await api.post('/api/podcasts/create', formData);
    return data;
  },

  getRecommended: async () => {
    try {
      const { data } = await api.get('/api/podcasts');
      return data.length > 0 ? data : MOCK_PODCASTS;
    } catch (err) {
      console.warn('Failed to fetch podcasts, using mocks', err);
      return MOCK_PODCASTS;
    }
  },

  getTrending: async () => {
    try {
      const { data } = await api.get('/api/podcasts/trending');
      return data.length > 0 ? data : [...MOCK_PODCASTS].reverse();
    } catch (err) {
      return [...MOCK_PODCASTS].reverse();
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
      const q = query.toLowerCase();
      return MOCK_PODCASTS.filter(p => 
        p.title.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q)
      );
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
