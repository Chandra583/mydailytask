const DailyProgress = require('../models/DailyProgress');
const Habit = require('../models/Habit');

/**
 * Helper: Get today's date in local format (YYYY-MM-DD)
 */
const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate streak for a habit
 * GOLDEN RULE: A day is "completed" if ANY period = 100%
 * @param {String} userId - User ID
 * @param {String} habitId - Habit ID
 * @returns {Object} Streak information
 */
const calculateStreak = async (userId, habitId) => {
  try {
    // Get all progress entries for this habit, sorted by date descending
    const progressEntries = await DailyProgress.find({
      userId,
      habitId
    }).sort({ date: -1 });

    if (progressEntries.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Filter to only "completed" days (ANY period = 100%)
    const completedDays = progressEntries.filter(p => {
      return (p.morning === 100 || p.afternoon === 100 || p.evening === 100 || p.night === 100);
    }).map(p => p.date).sort((a, b) => b.localeCompare(a)); // Sort descending

    if (completedDays.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const today = getLocalDateKey();
    const yesterday = getLocalDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check if the most recent completed day is today or yesterday
    const latestCompletedDate = completedDays[0];
    const isCurrentStreak = (latestCompletedDate === today || latestCompletedDate === yesterday);

    // Calculate streaks by going through dates
    // Group by consecutive days
    let checkDate = latestCompletedDate;
    
    for (const dateStr of completedDays) {
      if (dateStr === checkDate) {
        tempStreak++;
        // Move to previous day
        const d = new Date(checkDate + 'T00:00:00');
        d.setDate(d.getDate() - 1);
        checkDate = getLocalDateKey(d);
      } else {
        // Streak broken - check if this starts a new streak
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        if (isCurrentStreak && currentStreak === 0) {
          currentStreak = tempStreak;
        }
        // Start new streak count
        tempStreak = 1;
        checkDate = dateStr;
        const d = new Date(checkDate + 'T00:00:00');
        d.setDate(d.getDate() - 1);
        checkDate = getLocalDateKey(d);
      }
    }
    
    // Final check for longest streak
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    if (isCurrentStreak && currentStreak === 0) {
      currentStreak = tempStreak;
    }

    return { 
      currentStreak, 
      longestStreak,
      lastCompletedDate: latestCompletedDate
    };
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

/**
 * @desc    Get active streaks for all habits
 * @route   GET /api/streaks
 * @access  Private
 * 
 * GOLDEN RULE: A day is "completed" if ANY period = 100%
 */
const getStreaks = async (req, res) => {
  try {
    // Get all habits for user (include archived for streak history)
    const habits = await Habit.find({ 
      userId: req.user._id
    });

    // Calculate streaks for each habit
    const streaksPromises = habits.map(async (habit) => {
      const streakData = await calculateStreak(req.user._id, habit._id);
      
      return {
        habitId: habit._id,
        habitName: habit.name,
        category: habit.category,
        color: habit.color,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        lastCompletedDate: streakData.lastCompletedDate
      };
    });

    const streaks = await Promise.all(streaksPromises);

    // Sort by current streak (descending) and filter out zero streaks
    const activeStreaks = streaks
      .filter(s => s.currentStreak > 0)
      .sort((a, b) => b.currentStreak - a.currentStreak);

    // Get top 10 active streaks
    const top10Streaks = activeStreaks.slice(0, 10);

    res.json({
      allStreaks: streaks,
      activeStreaks,
      top10Streaks
    });
  } catch (error) {
    console.error('Streak error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStreaks,
  calculateStreak
};
