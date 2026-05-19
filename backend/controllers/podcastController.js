import Podcast from '../models/Podcast.js';
import User from '../models/User.js';
import { searchSpotifyPodcasts } from '../services/spotifyService.js';
import { searchGlobalPodcasts, getEpisodesFromFeed, getTopPodcasts } from '../services/globalPodcastService.js';

export const uploadPodcast = async (req, res) => {
  try {
    const { title, description, category, author } = req.body;
    const audio = req.files && req.files.audio ? `/uploads/${req.files.audio[0].filename}` : '';
    const image = req.files && req.files.image ? `/uploads/${req.files.image[0].filename}` : '';
    
    const podcast = new Podcast({
      id: Date.now().toString(),
      title,
      description,
      category,
      author: author || req.user.name,
      audio,
      image,
      uploadedBy: req.user._id,
      isPublic: true
    });
    
    await podcast.save();
    res.status(201).json(podcast);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find().populate('uploadedBy', 'name');
    res.json(podcasts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPodcastById = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id).populate('uploadedBy', 'name');
    if (!podcast) return res.status(404).json({ error: 'Podcast not found' });
    res.json(podcast);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const likePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'Podcast not found' });
    
    const user = await User.findById(req.user._id);
    if (!user.likedSongs) user.likedSongs = [];
    
    const index = user.likedSongs.findIndex(id => id.toString() === podcast._id.toString());
    
    if (index === -1) {
      user.likedSongs.push(podcast._id);
    } else {
      user.likedSongs.splice(index, 1);
    }
    
    await user.save();
    res.json(user.likedSongs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addToHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const podcastId = req.params.id;
    
    if (!user.history) user.history = [];
    
    const index = user.history.findIndex(item => item.podcast.toString() === podcastId);
    if (index !== -1) {
      user.history.splice(index, 1);
    }
    
    user.history.unshift({
      podcast: podcastId,
      listenedAt: new Date()
    });
    
    if (user.history.length > 20) user.history.pop();
    
    await user.save();
    res.json(user.history);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPodcastEpisodes = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'Podcast not found' });
    
    res.json([{
      id: `ep-${podcast._id}`,
      title: podcast.title,
      description: podcast.description,
      audio: podcast.audio,
      pub_date_ms: Date.now(),
      audio_length_sec: 0
    }]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const searchSpotify = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Search query is required' });
    const results = await searchSpotifyPodcasts(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchGlobal = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Search query is required' });
    const results = await searchGlobalPodcasts(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFeedEpisodes = async (req, res) => {
  try {
    const { feedUrl } = req.query;
    if (!feedUrl) return res.status(400).json({ error: 'feedUrl is required' });
    const episodes = await getEpisodesFromFeed(feedUrl);
    res.json(episodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTrending = async (req, res) => {
  try {
    const trending = await getTopPodcasts();
    res.json(trending);
  } catch (err) {
    // Fallback to internal trending if external fails
    const internalTrending = await Podcast.find({ isPublic: true }).sort({ listens: -1 }).limit(10);
    res.json(internalTrending);
  }
};

export const getMyPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({ uploadedBy: req.user._id });
    res.json(podcasts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'Podcast not found' });
    
    if (podcast.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    await Podcast.deleteOne({ _id: req.params.id });
    res.json({ message: 'Podcast removed' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const searchPodcasts = async (req, res) => {
  try {
    const { query } = req.params;
    const podcasts = await Podcast.find({
      isPublic: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ]
    }).populate('uploadedBy', 'name');
    res.json(podcasts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
