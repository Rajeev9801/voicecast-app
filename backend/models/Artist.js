import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const artistSchema = new mongoose.Schema({
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
    default: 'artist'
  },
  avatar: {
    type: String,
    default: ''
  },
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
  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast'
  }],
  history: [{
    podcast: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Podcast'
    },
    listenedAt: Date
  }],
  bio: String,
  resetPasswordOTP: String,
  resetPasswordOTPExpire: Date,
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
artistSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Compare password method
artistSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Artist = mongoose.model('Artist', artistSchema);
export default Artist;
