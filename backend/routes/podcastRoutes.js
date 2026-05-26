import express from 'express';
const router = express.Router();
import { 
  uploadPodcast, 
  getAllPodcasts, 
  getPodcastById, 
  likePodcast, 
  addToHistory, 
  getPodcastEpisodes, 
  searchSpotify,
  searchGlobal,
  getFeedEpisodes,
  getTrending,
  getMyPodcasts,
  getCreatorStats,
  deletePodcast,
  searchPodcasts
} from '../controllers/podcastController.js';
import { protect, podcaster } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

router.get('/', getAllPodcasts);
router.get('/trending', getTrending);
router.get('/creator-stats', protect, getCreatorStats);
router.get('/my', protect, getMyPodcasts);
router.get('/search/:query', searchPodcasts);
router.get('/spotify/search', searchSpotify);
router.get('/global/search', searchGlobal);
router.get('/global/episodes', getFeedEpisodes);
router.get('/:id', getPodcastById);
router.get('/:id/episodes', getPodcastEpisodes);
router.post('/upload', protect, podcaster, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), uploadPodcast);
router.post('/like/:id', protect, likePodcast);
router.post('/history/:id', protect, addToHistory);
router.delete('/:id', protect, deletePodcast);

export default router;
