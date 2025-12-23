const express = require('express');
const router = express.Router();
const { 
  getMonthlyProgress, 
  toggleProgress, 
  getStats,
  getDailyProgress,
  updateDailyProgress
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

/**
 * @route   GET /api/progress/stats
 * @desc    Get overall statistics
 * @access  Private
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/progress/daily/:date
 * @desc    Get daily progress for a specific date (format: YYYY-MM-DD)
 * @access  Private
 */
router.get('/daily/:date', getDailyProgress);

/**
 * @route   POST /api/progress/daily
 * @desc    Update habit progress for a time period
 * @access  Private
 */
router.post('/daily', updateDailyProgress);

/**
 * @route   GET /api/progress/:year/:month
 * @desc    Get monthly progress data
 * @access  Private
 */
router.get('/:year/:month', getMonthlyProgress);

/**
 * @route   POST /api/progress/toggle
 * @desc    Toggle habit completion for a date
 * @access  Private
 */
router.post('/toggle', toggleProgress);

module.exports = router;
