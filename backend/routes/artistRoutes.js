import express from 'express';
import { forgotPasswordArtist, resetPasswordArtist } from '../controllers/authController.js';

const router = express.Router();

router.post('/forgot-password', forgotPasswordArtist);
router.post('/reset-password', resetPasswordArtist);

export default router;
