const Progress = require('../models/Progress');
const Habit = require('../models/Habit');

/**
 * Calculate streak for a habit
 * @param {String} userId - User ID
 * @param {String} habitId - Habit ID
 * @returns {Object} Streak information
 */
const calculateStreak = async (userId, habitId) => {
  try {
    // Get all completed progress entries for this habit, sorted by date descending
    const progressEntries = await Progress.find({
      userId,
      habitId,
      completed: true
    }).sort({ date: -1 });

    if (progressEntries.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if streak is current (includes today or yesterday)
    const latestDate = new Date(progressEntries[0].date);
    latestDate.setHours(0, 0, 0, 0);
    
    const isCurrentStreak = latestDate >= yesterday;

    if (isCurrentStreak) {
      currentStreak = 1;
      
      // Calculate current streak
      for (let i = 1; i < progressEntries.length; i++) {
        const currentDate = new Date(progressEntries[i - 1].date);
        currentDate.setHours(0, 0, 0, 0);
        
        const previousDate = new Date(progressEntries[i].date);
        previousDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    longestStreak = tempStreak;
    for (let i = 1; i < progressEntries.length; i++) {
      const currentDate = new Date(progressEntries[i - 1].date);
      currentDate.setHours(0, 0, 0, 0);
      
      const previousDate = new Date(progressEntries[i].date);
      previousDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return { 
      currentStreak, 
      longestStreak,
      lastCompletedDate: progressEntries[0].date
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
 */
const getStreaks = async (req, res) => {
  try {
    // Get all active habits for user
    const habits = await Habit.find({ 
      userId: req.user._id, 
      isActive: true 
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStreaks,
  calculateStreak
};
