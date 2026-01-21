const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const StreakHistory = require('../models/StreakHistory');

// All routes are protected
router.use(protect);

/**
 * @route   GET /api/streak-history/active
 * @desc    Get all active streaks for today
 * @access  Private
 */
router.get('/active', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const activeStreaks = await StreakHistory.find({
      userId: req.user._id,
      snapshotDate: today,
      streakType: 'active',
      currentStreak: { $gt: 0 }
    }).sort({ currentStreak: -1 });
    
    res.json(activeStreaks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/streak-history/archived
 * @desc    Get archived streaks (from deleted tasks)
 * @access  Private
 */
router.get('/archived', async (req, res) => {
  try {
    const archivedStreaks = await StreakHistory.find({
      userId: req.user._id,
      streakType: 'archived',
      isArchived: true
    })
    .sort({ archivedAt: -1, longestStreak: -1 })
    .limit(50); // Last 50 archived streaks
    
    res.json(archivedStreaks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/streak-history/habit/:habitId
 * @desc    Get streak history for specific habit
 * @access  Private
 */
router.get('/habit/:habitId', async (req, res) => {
  try {
    const history = await StreakHistory.find({
      userId: req.user._id,
      habitId: req.params.habitId
    }).sort({ snapshotDate: -1 });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/streak-history/top
 * @desc    Get top 10 all-time longest streaks (including archived)
 * @access  Private
 */
router.get('/top', async (req, res) => {
  try {
    const topStreaks = await StreakHistory.aggregate([
      { $match: { userId: req.user._id } },
      { $sort: { habitId: 1, snapshotDate: -1 } },
      { $group: {
        _id: '$habitId',
        habitName: { $first: '$habitName' },
        habitColor: { $first: '$habitColor' },
        longestStreak: { $max: '$longestStreak' },
        isArchived: { $first: '$isArchived' }
      }},
      { $sort: { longestStreak: -1 } },
      { $limit: 10 }
    ]);
    
    res.json(topStreaks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
