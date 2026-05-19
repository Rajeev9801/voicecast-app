import express from 'express';
import { uploadRecording, getMyRecordings, deleteRecording } from '../controllers/recordingController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, upload.single('audio'), uploadRecording);
router.get('/', protect, getMyRecordings);
router.delete('/:id', protect, deleteRecording);

export default router;
