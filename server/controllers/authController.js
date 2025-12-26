const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with that email or username' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Google OAuth Login/Register
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = async (req, res) => {
  const { token, email, name, picture } = req.body;

  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;

    // Check if user exists with this Google ID or email
    let user = await User.findOne({ 
      $or: [{ googleId }, { email: email.toLowerCase() }] 
    });

    if (user) {
      // User exists - update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      // Create new user with Google
      // Generate unique username from email or name
      let username = name.replace(/\s+/g, '').toLowerCase();
      let existingUser = await User.findOne({ username });
      if (existingUser) {
        username = `${username}${Date.now().toString().slice(-4)}`;
      }

      user = await User.create({
        username,
        email: email.toLowerCase(),
        googleId,
        picture,
        authProvider: 'google'
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      picture: user.picture,
      token: jwtToken
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Google authentication failed' 
    });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getProfile
};
