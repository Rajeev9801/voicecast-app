import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Artist from '../models/Artist.js';
import { sendOTPEmail } from '../services/emailService.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user or artist (Initial Step: Send OTP)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase() : '';
    
    console.log("📝 [AUTH-DEBUG] Registration request:", { name, email, role });

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check both collections for existing email
    const userExists = await User.findOne({ email });
    const artistExists = await Artist.findOne({ email });

    if (userExists || artistExists) {
      const existing = userExists || artistExists;
      // If user exists but is not verified, we can allow re-sending OTP
      if (!existing.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        existing.otp = otp;
        existing.otpExpire = Date.now() + 10 * 60 * 1000;
        // Update other info in case user changed it
        existing.name = name;
        existing.password = password; 
        await existing.save();

        const emailSent = await sendOTPEmail(email, otp, 'verification');
        if (!emailSent) {
          console.error(`❌ [AUTH-ERROR] Failed to send verification OTP to ${email}`);
          return res.status(500).json({ message: 'Error sending verification email. Check backend logs.' });
        }

        return res.status(200).json({ message: 'Verification OTP sent to your email' });
      }
      
      console.log("❌ [AUTH-DEBUG] Registration failed: Email already verified", email);
      return res.status(400).json({ message: 'Email already registered and verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000;

    let user;
    let finalRole = role || 'user';

    if (finalRole === 'artist' || finalRole === 'podcaster') {
      user = new Artist({
        name,
        email,
        password,
        role: 'artist',
        otp,
        otpExpire
      });
    } else {
      user = new User({
        name,
        email,
        password,
        role: finalRole === 'admin' ? 'admin' : 'user',
        otp,
        otpExpire
      });
    }

    await user.save();

    const emailSent = await sendOTPEmail(email, otp, 'verification');
    if (!emailSent) {
      console.error(`❌ [AUTH-ERROR] Failed to send verification OTP to ${email}`);
      return res.status(500).json({ message: 'Error sending verification email. Check backend logs.' });
    }

    res.status(200).json({ message: 'Verification OTP sent to your email' });
  } catch (error) {
    console.error("🔥 [AUTH-DEBUG] Registration error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(`🔍 [AUTH-DEBUG] Verifying Registration OTP for: ${email}`);

    let user = await User.findOne({ 
      email: email.toLowerCase(),
      otp: otp,
      otpExpire: { $gt: Date.now() }
    });

    if (!user) {
      user = await Artist.findOne({ 
        email: email.toLowerCase(),
        otp: otp,
        otpExpire: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    console.log(`✅ [AUTH-DEBUG] Email verified for: ${email}`);
    
    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @route   POST /api/auth/login/:role
// @access  Public
export const authUser = async (req, res) => {
  try {
    console.log("\n==== [BACKEND-AUTH-TRACE] START ====");
    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("PARAMS:", req.params);
    console.log("REQ BODY:", req.body);
    
    const email = req.body.email ? req.body.email.toLowerCase().trim() : '';
    const role = req.params.role || req.body.role;
    const ADMIN_EMAIL = "rajeevkumar9801456p@gmail.com";

    console.log("EXTRACTED EMAIL:", email);
    console.log("EXTRACTED ROLE:", role);

    // Strict Admin Access Check
    if (role === 'admin' || req.originalUrl.includes('/admin')) {
      console.log("🛡️ [ADMIN-AUTH] Verifying Admin Identity...");
      console.log("INPUT EMAIL:", email);
      console.log("TARGET EMAIL:", ADMIN_EMAIL);
      
      const cleanInput = email.replace(/\s/g, '');
      const cleanTarget = ADMIN_EMAIL.replace(/\s/g, '');
      
      console.log("CLEAN INPUT:", cleanInput);
      console.log("CLEAN TARGET:", cleanTarget);

      if (cleanInput !== cleanTarget) {
        console.log("❌ [ADMIN-AUTH] FAILED: Access Denied for", email);
        return res.status(403).json({
          success: false,
          message: "Access Denied"
        });
      }
      console.log("✅ [ADMIN-AUTH] Admin Identity Verified.");
    }
    
    // Normalize Password Field
    const loginPassword = req.body.password || req.body.newPassword || req.body.userPassword;

    console.log("EMAIL:", email);
    console.log("ROLE:", role);
    console.log("INPUT PASSWORD:", `"${loginPassword}"`);
    console.log("INPUT PASSWORD LENGTH:", loginPassword.length);

    if (!email || !loginPassword) {
      console.log("❌ LOGIN FAILED: Missing email or password");
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = null;
    let collection = "";

    // STRICT COLLECTION SEPARATION
    if (role === 'artist' || role === 'podcaster') {
      user = await Artist.findOne({ email });
      collection = "ARTISTS";
    } else {
      user = await User.findOne({ email });
      collection = "USERS";
    }

    console.log("USER FOUND:", !!user);
    if (user) {
      console.log("COLLECTION:", collection);
      console.log("DB PASSWORD HASH:", user.password);
    }

    if (!user) {
      console.log("❌ LOGIN FAILED: User not found");
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified && role !== 'admin') {
      console.log("⚠️ LOGIN FAILED: User not verified");
      return res.status(401).json({ 
        message: 'Please verify your email first',
        unverified: true 
      });
    }

    if (!user.password) {
      console.log("❌ LOGIN FAILED: Password missing in database");
      return res.status(400).json({ message: "Password missing in database" });
    }

    const isMatch = await bcrypt.compare(loginPassword, user.password);
    console.log("COMPARE RESULT:", isMatch);

    if (isMatch) {
      console.log("🎉 LOGIN SUCCESSFUL:", email);
      const token = generateToken(user._id, user.role);
      console.log("JWT GENERATED:", token.substring(0, 20) + "...");
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: token,
      });
    } else {
      console.log("❌ LOGIN FAILED: Password mismatch");
      res.status(401).json({ message: 'Invalid email or password' });
    }
    console.log("==== LOGIN END ====\n");
  } catch (error) {
    console.error("🔥 [LOGIN-CRITICAL-ERROR]:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP (for Resend)
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) user = await Artist.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000;

    if (purpose === 'reset') {
      user.resetPasswordOTP = otp;
      user.resetPasswordOTPExpire = otpExpire;
    } else {
      user.otp = otp;
      user.otpExpire = otpExpire;
    }

    await user.save();
    
    const emailSent = await sendOTPEmail(email, otp, purpose === 'reset' ? 'reset' : 'verification');
    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending email' });
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password for Users
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPasswordUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const emailSent = await sendOTPEmail(email, otp, 'reset');
    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending reset email' });
    }

    res.json({ message: 'Reset OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password for Artist
// @route   POST /api/artists/forgot-password
// @access  Public
export const forgotPasswordArtist = async (req, res) => {
  try {
    const { email } = req.body;
    const artist = await Artist.findOne({ email: email.toLowerCase() });

    if (!artist) {
      return res.status(404).json({ message: 'Artist not found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    artist.resetPasswordOTP = otp;
    artist.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;
    await artist.save();

    const emailSent = await sendOTPEmail(email, otp, 'reset');
    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending reset email' });
    }

    res.json({ message: 'Reset OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password for Artist
// @route   POST /api/artists/reset-password
// @access  Public
export const resetPasswordArtist = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const updatedPassword = req.body.newPassword || req.body.password;

    console.log("-----------------------------------------");
    console.log("🔑 [RESET-DEBUG] Artist Reset Attempt");
    console.log("📧 [RESET-DEBUG] Email:", email);

    if (!updatedPassword) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await Artist.findOne({
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() }
    });

    if (!user) {
      console.log("❌ [RESET-DEBUG] FAILED: Invalid or expired OTP");
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Assign plain password. Mongoose pre-save hook will hash it ONCE.
    // Removing manual hashing to prevent DOUBLE HASHING.
    user.password = updatedPassword;
    
    // Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    console.log("✅ [RESET-DEBUG] SUCCESS: Password saved for", user.email);
    console.log("🔐 [RESET-DEBUG] DB Hash after save:", user.password.substring(0, 15) + "...");
    res.json({ success: true, message: 'Password reset successful' });
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("🔥 [RESET-DEBUG] CRITICAL ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request OTP for Admin Login/Setup
// @route   POST /api/auth/admin/request-otp
// @access  Public
export const requestAdminOTP = async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : '';
    const ADMIN_EMAIL = "rajeevkumar9801456p @gmail.com";

    console.log("-----------------------------------------");
    console.log("🛡️ [ADMIN-LOGIN] Requesting OTP");
    console.log("ADMIN LOGIN EMAIL:", email);
    console.log("EXPECTED ADMIN:", ADMIN_EMAIL);

    if (email.replace(/\s/g, '') !== ADMIN_EMAIL.replace(/\s/g, '')) {
      console.log("❌ [ADMIN-LOGIN] FAILED: Access Denied for", email);
      return res.status(403).json({
        success: false,
        message: "Access Denied"
      });
    }

    // Find or create the admin user
    let user = await User.findOne({ email: email.replace(/\s/g, '') });
    if (!user) {
      console.log("📝 [ADMIN-LOGIN] Creating new admin record");
      user = new User({
        name: "Administrator",
        email: email.replace(/\s/g, ''),
        password: Math.random().toString(36).slice(-10), // Placeholder
        role: 'admin',
        isVerified: true
      });
    } else {
      console.log("📝 [ADMIN-LOGIN] Admin record found. Ensuring role/verification.");
      user.role = 'admin'; // Ensure role is correct
      user.isVerified = true;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const emailSent = await sendOTPEmail(email, otp, 'reset');
    if (!emailSent) {
      console.error("❌ [ADMIN-LOGIN] Failed to send OTP email");
      return res.status(500).json({ message: 'Error sending OTP' });
    }

    console.log("✅ [ADMIN-LOGIN] OTP sent to", email);
    res.json({ success: true, message: 'Admin Access Code sent to your email' });
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("🔥 [ADMIN-LOGIN-ERROR]:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set Password for Admin
// @route   POST /api/auth/admin/set-password
// @access  Public
export const setAdminPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const ADMIN_EMAIL = "rajeevkumar9801456p @gmail.com".toLowerCase().trim();

    console.log("🛡️ [ADMIN-PASSWORD-SET] Attempt for:", email);

    if (email.toLowerCase().trim() !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    user.role = 'admin';
    await user.save();

    console.log("✅ [ADMIN-PASSWORD-SET] SUCCESS: Password established for admin");
    res.json({ success: true, message: 'Admin password established successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password for User
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPasswordUser = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const updatedPassword = req.body.newPassword || req.body.password;

    console.log("-----------------------------------------");
    console.log("🔑 [RESET-DEBUG] User Reset Attempt");
    console.log("📧 [RESET-DEBUG] Email:", email);

    if (!updatedPassword) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() }
    });

    if (!user) {
      console.log("❌ [RESET-DEBUG] FAILED: Invalid or expired OTP");
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Assign plain password. Mongoose pre-save hook will hash it ONCE.
    // Removing manual hashing to prevent DOUBLE HASHING.
    user.password = updatedPassword;

    // Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    console.log("✅ [RESET-DEBUG] SUCCESS: Password saved for", user.email);
    console.log("🔐 [RESET-DEBUG] DB Hash after save:", user.password.substring(0, 15) + "...");
    res.json({ success: true, message: 'Password reset successful' });
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("🔥 [RESET-DEBUG] CRITICAL ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(`🔍 [AUTH-DEBUG] Verifying OTP for: ${email}`);
    
    // Check ONLY Users collection (Artists have their own flow)
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      console.log(`❌ [AUTH-DEBUG] OTP verification FAILED for: ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    console.log(`✅ [AUTH-DEBUG] OTP verification SUCCESSFUL for: ${email}`);
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).populate('likedSongs');
    if (!user) user = await Artist.findById(req.user._id).populate('likedSongs');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        recordings: user.recordings || [],
        likedSongs: user.likedSongs || [],
        playlists: user.playlists || []
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      user.avatar = req.body.avatar || user.avatar;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id, updatedUser.role),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// History and Playlists (preserving previous functionality)

export const addToHistory = async (req, res) => {
  try {
    const { podcastId } = req.body;
    const user = await User.findById(req.user._id);
    user.history.push({ podcast: podcastId, listenedAt: new Date() });
    await user.save();
    res.json({ message: 'History updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('history.podcast');
    res.json({ history: user.history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;
    console.log("📂 [PLAYLIST-CREATE] NAME:", name);
    console.log("📂 [PLAYLIST-CREATE] USER:", req.user?._id);

    const user = await User.findById(req.user._id);
    user.playlists.push({ name, podcasts: [] });
    await user.save();
    console.log("✅ [PLAYLIST-CREATE] SUCCESS");
    res.json({ message: 'Playlist created', playlists: user.playlists });
  } catch (error) {
    console.error("🔥 [PLAYLIST-CREATE] ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToPlaylist = async (req, res) => {
  try {
    const { podcastId } = req.body;
    const { name } = req.params;
    console.log("📂 [PLAYLIST-ADD] NAME:", name, "PODCAST:", podcastId);
    console.log("📂 [PLAYLIST-ADD] USER:", req.user?._id);

    const user = await User.findById(req.user._id);
    const playlist = user.playlists.find(p => p.name === name);
    if (!playlist) {
      console.warn("❌ [PLAYLIST-ADD] Playlist not found:", name);
      return res.status(404).json({ error: 'Playlist not found' });
    }
    playlist.podcasts.push(podcastId);
    await user.save();
    console.log("✅ [PLAYLIST-ADD] SUCCESS");
    res.json({ message: 'Added to playlist' });
  } catch (error) {
    console.error("🔥 [PLAYLIST-ADD] ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
