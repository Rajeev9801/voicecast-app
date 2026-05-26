import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    required: true,
    enum: ['User', 'Artist']
  },
  podcasts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast'
  }]
}, {
  timestamps: true
});

const Playlist = mongoose.model('Playlist', playlistSchema);
export default Playlist;
