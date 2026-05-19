import mongoose from 'mongoose';

const podcastSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  author: String,
  image: String,
  audio: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  duration: Number,
  category: String,
  isPublic: {
    type: Boolean,
    default: true
  },
  listens: {
    type: Number,
    default: 0
  }
});

const Podcast = mongoose.model('Podcast', podcastSchema);
export default Podcast;
