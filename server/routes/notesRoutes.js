const express = require('express');
const router = express.Router();
const { getNotes, updateNotes } = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

/**
 * @route   GET /api/notes/:year/:month
 * @desc    Get notes for a specific month
 * @access  Private
 */
router.get('/:year/:month', getNotes);

/**
 * @route   PUT /api/notes/:year/:month
 * @desc    Update notes for a specific month
 * @access  Private
 */
router.put('/:year/:month', updateNotes);

module.exports = router;
