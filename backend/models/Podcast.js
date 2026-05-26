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
    required: true,
    refPath: 'onModel'
  },
  on: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    required: true,
    enum: ['User', 'Artist']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  duration: Number,
  category: String,
  genre: String,
  isPublic: {
    type: Boolean,
    default: true
  },
  listens: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Podcast = mongoose.model('Podcast', podcastSchema);
export default Podcast;
