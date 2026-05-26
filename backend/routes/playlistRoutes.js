import express from 'express';
import { 
  createPlaylist, 
  getMyPlaylists, 
  addToPlaylist, 
  removeFromPlaylist, 
  deletePlaylist 
} from '../controllers/playlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createPlaylist);
router.get('/', getMyPlaylists);
router.post('/:id/add', addToPlaylist);
router.post('/:id/remove', removeFromPlaylist);
router.delete('/:id', deletePlaylist);

export default router;
