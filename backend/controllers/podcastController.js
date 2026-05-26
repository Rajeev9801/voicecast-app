import Podcast from '../models/Podcast.js';
import User from '../models/User.js';
import { searchSpotifyPodcasts } from '../services/spotifyService.js';
import { searchGlobalPodcasts, getEpisodesFromFeed, getTopPodcasts } from '../services/globalPodcastService.js';

const sendSuccess = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'Internal Server Error', status = 500, error = null) => {
  return res.status(status).json({
    success: false,
    message,
    error: error ? error.message : undefined,
    stack: process.env.NODE_ENV === 'development' && error ? error.stack : undefined
  });
};

export const uploadPodcast = async (req, res) => {
  try {
    const audioFile = req.file || (req.files?.audio ? req.files.audio[0] : null);
    const imageFile = req.files?.thumbnail ? req.files.thumbnail[0] : (req.files?.image ? req.files.image[0] : null);

    if (!audioFile) {
      return sendError(res, "Audio file is required", 400);
    }

    const { title, description, genre, category } = req.body;

    if (!title) {
      return sendError(res, "Title is required", 400);
    }

    const audioPath = `/uploads/${audioFile.filename}`;
    const imagePath = imageFile ? `/uploads/${imageFile.filename}` : '';

    const podcast = await Podcast.create({
      id: Date.now().toString(),
      title,
      description: description || '',
      genre: genre || category || 'General',
      category: category || genre || 'General',
      audio: audioPath,
      image: imagePath,
      uploadedBy: req.user._id,
      on: req.user._id,
      onModel: req.user.role === 'admin' ? 'User' : 
               (req.user.role === 'artist' || req.user.role === 'podcaster' ? 'Artist' : 'User'),
      author: req.user.name || 'VoiceCast Creator',
      isPublic: true
    });

    const user = req.user;
    if (user) {
      if (!user.uploadedPodcasts) user.uploadedPodcasts = [];
      user.uploadedPodcasts.push(podcast._id);
      await user.save();
    }

    return sendSuccess(res, podcast, "Podcast published successfully", 201);
  } catch (err) {
    return sendError(res, "Failed to upload podcast", 500, err);
  }
};

export const getCreatorStats = async (req, res) => {
  try {
    const podcasts = await Podcast.find({ uploadedBy: req.user._id });
    const totalPlays = podcasts.reduce((acc, p) => acc + (p.listens || 0), 0);
    const totalPodcasts = podcasts.length;
    
    return sendSuccess(res, {
      totalPodcasts,
      totalPlays,
      totalFollowers: Math.floor(totalPlays * 0.1),
      monthlyGrowth: "+12.5%"
    });
  } catch (err) {
    return sendError(res, "Failed to fetch creator stats", 500, err);
  }
};

export const getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find()
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    return sendSuccess(res, podcasts);
  } catch (err) {
    return sendError(res, "Failed to fetch podcasts", 500, err);
  }
};

export const getPodcastById = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, "Podcast ID is required", 400);
    
    const podcast = await Podcast.findById(req.params.id).populate('uploadedBy', 'name');
    if (!podcast) return sendError(res, "Podcast not found", 404);
    
    return sendSuccess(res, podcast);
  } catch (err) {
    return sendError(res, "Failed to fetch podcast", 500, err);
  }
};

export const likePodcast = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, "Podcast ID is required", 400);

    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return sendError(res, "Podcast not found", 404);
    
    const user = req.user;
    if (!user.likedSongs) user.likedSongs = [];
    
    const index = user.likedSongs.findIndex(id => id.toString() === podcast._id.toString());
    
    if (index === -1) {
      user.likedSongs.push(podcast._id);
    } else {
      user.likedSongs.splice(index, 1);
    }
    
    await user.save();
    return sendSuccess(res, user.likedSongs, index === -1 ? "Liked" : "Unliked");
  } catch (err) {
    return sendError(res, "Failed to like/unlike podcast", 500, err);
  }
};

export const addToHistory = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, "Podcast ID is required", 400);

    const user = req.user;
    const podcastId = req.params.id;
    
    if (!user.history) user.history = [];
    
    const index = user.history.findIndex(item => item.podcast && item.podcast.toString() === podcastId);
    if (index !== -1) {
      user.history.splice(index, 1);
    }
    
    user.history.unshift({
      podcast: podcastId,
      listenedAt: new Date()
    });
    
    if (user.history.length > 20) user.history.pop();
    
    await user.save();
    return sendSuccess(res, user.history);
  } catch (err) {
    return sendError(res, "Failed to update history", 500, err);
  }
};

export const getPodcastEpisodes = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, "Podcast ID is required", 400);

    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return sendError(res, "Podcast not found", 404);
    
    const episodes = [{
      id: `ep-${podcast._id}`,
      title: podcast.title,
      description: podcast.description,
      audio: podcast.audio,
      pub_date_ms: Date.now(),
      audio_length_sec: 0
    }];

    return sendSuccess(res, episodes);
  } catch (err) {
    return sendError(res, "Failed to fetch episodes", 500, err);
  }
};

export const searchSpotify = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return sendError(res, 'Search query is required', 400);
    const results = await searchSpotifyPodcasts(query);
    return sendSuccess(res, results);
  } catch (err) {
    return sendError(res, "Spotify search failed", 500, err);
  }
};

export const searchGlobal = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return sendError(res, 'Search query is required', 400);
    const results = await searchGlobalPodcasts(query);
    return sendSuccess(res, results);
  } catch (err) {
    return sendError(res, "Global search failed", 500, err);
  }
};

export const getFeedEpisodes = async (req, res) => {
  try {
    const { feedUrl } = req.query;
    if (!feedUrl) return sendError(res, 'feedUrl is required', 400);
    const episodes = await getEpisodesFromFeed(feedUrl);
    return sendSuccess(res, episodes);
  } catch (err) {
    return sendError(res, "Failed to fetch feed episodes", 500, err);
  }
};

export const getTrending = async (req, res) => {
  try {
    const trending = await getTopPodcasts();
    if (trending && trending.length > 0) {
      return sendSuccess(res, trending);
    }
    throw new Error('No external trending podcasts found');
  } catch (err) {
    try {
      const internalTrending = await Podcast.find({ isPublic: true }).sort({ listens: -1 }).limit(10);
      return sendSuccess(res, internalTrending, "Fetched internal trending (fallback)");
    } catch (innerErr) {
      return sendError(res, "Failed to fetch trending podcasts", 500, innerErr);
    }
  }
};

export const getMyPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({ uploadedBy: req.user._id });
    return sendSuccess(res, podcasts);
  } catch (err) {
    return sendError(res, "Failed to fetch your podcasts", 500, err);
  }
};

export const deletePodcast = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, "Podcast ID is required", 400);

    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return sendError(res, "Podcast not found", 404);
    
    if (podcast.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized', 401);
    }
    
    await Podcast.deleteOne({ _id: req.params.id });
    return sendSuccess(res, null, 'Podcast removed');
  } catch (err) {
    return sendError(res, "Failed to delete podcast", 500, err);
  }
};

export const searchPodcasts = async (req, res) => {
  try {
    const { query } = req.params;
    if (!query) return sendError(res, "Search query is required", 400);

    const podcasts = await Podcast.find({
      isPublic: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ]
    }).populate('uploadedBy', 'name');
    
    return sendSuccess(res, podcasts);
  } catch (err) {
    return sendError(res, "Podcast search failed", 500, err);
  }
};
