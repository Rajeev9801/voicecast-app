import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Artist from '../models/Artist.js';

const JWT_SECRET = process.env.JWT_SECRET || 'voicecast-secret-key-2024';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      console.log(`🛡️ [AUTH-DEBUG] Protecting route. Decoded ID: ${decoded.id}, Role: ${decoded.role}`);

      // Try searching based on role first
      if (decoded.role === 'artist' || decoded.role === 'podcaster') {
        req.user = await Artist.findById(decoded.id).select('-password');
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }

      // Fallback: if not found in preferred collection, check the other one
      if (!req.user) {
        console.log(`⚠️ [AUTH-DEBUG] User not found in preferred collection for role ${decoded.role}. Trying fallback...`);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          req.user = await Artist.findById(decoded.id).select('-password');
        }
      }
      
      if (!req.user) {
        console.log("❌ [AUTH-DEBUG] User not found in any collection after decoding token.");
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Backward compatibility for routes using req.userId/req.isAdmin
      req.userId = req.user._id;
      req.isAdmin = req.user.role === 'admin';
      
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const podcaster = (req, res, next) => {
  if (req.user && (req.user.role === 'podcaster' || req.user.role === 'artist' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a podcaster' });
  }
};

// Aliases for backward compatibility
export const authenticate = protect;
export const isPodcaster = podcaster;
