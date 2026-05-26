import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    if (file.mimetype.startsWith('audio/') || file.mimetype.includes('webm')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  } else if (file.fieldname === 'thumbnail' || file.fieldname === 'image') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  } else {
    // Fallback for single uploads
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/') || file.mimetype.includes('webm')) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed!'));
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

export default upload;
