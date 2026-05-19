const MOCK_PODCASTS = [
  { _id: '1', title: 'The Daily Voice', author: 'VoiceCast', category: 'News', duration: '15:00', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://images.unsplash.com/photo-1478737270239-2fccd27ee1f3?auto=format&fit=crop&q=80&w=400' },
  { _id: '2', title: 'Tech Talk', author: 'Silicon Valley', category: 'Technology', duration: '45:00', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=400' },
  { _id: '3', title: 'Mindset Matters', author: 'Growth Co.', category: 'Self-Help', duration: '20:00', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://images.unsplash.com/photo-1499209974431-9dac3e5c97de?auto=format&fit=crop&q=80&w=400' },
  { _id: '4', title: 'Creative Minds', author: 'Art Pulse', category: 'Design', duration: '32:00', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400' },
  { _id: '5', title: 'Future Pulse', author: 'Deep Blue', category: 'Science', duration: '28:00', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400' },
];

const getLocalRecordings = () => {
  try {
    return JSON.parse(localStorage.getItem('voicecast_recordings') || '[]');
  } catch {
    return [];
  }
};

export const podcastService = {
  getRecommended: async () => {
    return [...getLocalRecordings(), ...MOCK_PODCASTS];
  },

  getTrending: async () => {
    return [...MOCK_PODCASTS].reverse();
  },

  search: async (query) => {
    const q = query.toLowerCase();
    return [...getLocalRecordings(), ...MOCK_PODCASTS].filter(p => 
      p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)
    );
  },

  searchSpotify: async (query) => {
    return podcastService.search(query);
  },

  searchGlobal: async (query) => {
    return podcastService.search(query);
  },

  getFeedEpisodes: async (feedUrl) => {
    return [];
  },

  getEpisodes: async (podcastId) => {
    return [];
  },

  deletePodcast: async (podcastId) => {
    const recordings = getLocalRecordings();
    const updated = recordings.filter(r => r._id !== podcastId);
    localStorage.setItem('voicecast_recordings', JSON.stringify(updated));
    return { success: true };
  },
};
