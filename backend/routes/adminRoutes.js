import express from 'express';
import { 
  getAnalytics, 
  getAllUsers, 
  getAllPodcasts, 
  deleteUser, 
  deletePodcast,
  updateUserRole,
  getAdminStats
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here are protected by admin middleware
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.get('/podcasts', getAllPodcasts);
router.delete('/users/:id', deleteUser);
router.delete('/podcasts/:id', deletePodcast);
router.patch('/users/:id/role', updateUserRole);

export default router;
