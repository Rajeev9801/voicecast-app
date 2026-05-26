import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    required: true,
    enum: ['User', 'Artist']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Recording = mongoose.model('Recording', recordingSchema);
export default Recording;
