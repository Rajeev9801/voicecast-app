import express from 'express';
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/all', protect, admin, getAllUsers);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.delete('/:id', protect, admin, deleteUser);

export default router;
