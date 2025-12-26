const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, googleAuth, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth Login/Register
 * @access  Public
 */
router.post('/google', googleAuth);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

module.exports = router;
