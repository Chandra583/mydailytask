const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getHabits, 
  createHabit, 
  updateHabit, 
  deleteHabit 
} = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

/**
 * @route   GET /api/habits
 * @desc    Get all habits for user
 * @access  Private
 */
router.get('/', getHabits);

/**
 * @route   POST /api/habits
 * @desc    Create new habit
 * @access  Private
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Habit name is required')
  ],
  createHabit
);

/**
 * @route   PUT /api/habits/:id
 * @desc    Update habit
 * @access  Private
 */
router.put('/:id', updateHabit);

/**
 * @route   DELETE /api/habits/:id
 * @desc    Delete habit
 * @access  Private
 */
router.delete('/:id', deleteHabit);

module.exports = router;
