const express = require('express');
const router = express.Router();
const { getStreaks } = require('../controllers/streakController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

/**
 * @route   GET /api/streaks
 * @desc    Get active streaks for all habits
 * @access  Private
 */
router.get('/', getStreaks);

module.exports = router;
