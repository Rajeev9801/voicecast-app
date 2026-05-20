import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ 
      name, 
      email, 
      password,
      role: role || 'user'
    });
    await user.save();
    
    res.status(201).json({ 
      token: generateToken(user._id), 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role
      } 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      res.json({ 
        token: generateToken(user._id), 
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email,
          role: user.role
        } 
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
