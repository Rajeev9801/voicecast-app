import express from 'express';
import { uploadRecording, getMyRecordings, deleteRecording } from '../controllers/recordingController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use((req, res, next) => {
  console.log(`📡 [RECORDING-ROUTE] ${req.method} ${req.url}`);
  next();
});

router.post('/', protect, (req, res, next) => {
  console.log("📡 [RECORDING-POST] Entering route handler");
  next();
}, upload.single('audio'), uploadRecording);

// Alias as requested
router.post('/save', protect, (req, res, next) => {
  console.log("📡 [RECORDING-SAVE] Alias hit");
  next();
}, upload.single('audio'), uploadRecording);

router.get('/', protect, getMyRecordings);
router.delete('/:id', protect, deleteRecording);

export default router;
