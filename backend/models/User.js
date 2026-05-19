import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'podcaster'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast'
  }],
  recordings: [{
    title: String,
    url: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  uploadedPodcasts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast'
  }],
  playlists: [{
    name: String,
    podcasts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Podcast'
    }]
  }],
  history: [{
    podcast: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Podcast'
    },
    listenedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
