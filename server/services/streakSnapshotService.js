const StreakHistory = require('../models/StreakHistory');
const Habit = require('../models/Habit');
const DailyProgress = require('../models/DailyProgress'); // Using DailyProgress instead of Progress

/**
 * Calculate and save streak snapshot for a specific habit
 */
const createStreakSnapshot = async (userId, habitId, snapshotDate) => {
  try {
    // Get habit details
    const habit = await Habit.findById(habitId);
    if (!habit) {
      console.log(`Habit ${habitId} not found, might be deleted`);
      return null;
    }

    // Calculate current streak
    const streakData = await calculateStreakForHabit(userId, habitId, snapshotDate);

    // Create or update snapshot
    const snapshot = await StreakHistory.findOneAndUpdate(
      {
        userId,
        habitId,
        snapshotDate
      },
      {
        habitName: habit.name,
        habitColor: habit.color,
        habitCategory: habit.category,
        streakType: habit.isActive ? 'active' : 'archived',
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        startDate: streakData.startDate,
        endDate: streakData.endDate,
        lastCompletedDate: streakData.lastCompletedDate,
        totalCompletions: streakData.totalCompletions,
        completionRate: streakData.completionRate,
        isArchived: !habit.isActive,
        archivedAt: habit.archivedAt
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return snapshot;
  } catch (error) {
    console.error('Error creating streak snapshot:', error);
    throw error;
  }
};

/**
 * Calculate streak statistics for a habit up to a specific date
 */
const calculateStreakForHabit = async (userId, habitId, upToDate) => {
  try {
    // Get all completions for this habit, sorted by date (using DailyProgress model)
    // A task is considered completed if ANY time period (morning, afternoon, evening, night) is 100%
    const progressData = await DailyProgress.find({
      userId,
      habitId,
      date: { $lte: upToDate }
    }).sort({ date: 1 });

    if (progressData.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        startDate: null,
        endDate: null,
        lastCompletedDate: null,
        totalCompletions: 0,
        completionRate: 0
      };
    }

    // Filter for completed days (any period = 100%)
    const completedDates = [];
    progressData.forEach(progress => {
      if ((progress.morning || 0) === 100 || 
          (progress.afternoon || 0) === 100 || 
          (progress.evening || 0) === 100 || 
          (progress.night || 0) === 100) {
        completedDates.push(progress.date);
      }
    });

    if (completedDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        startDate: null,
        endDate: null,
        lastCompletedDate: null,
        totalCompletions: 0,
        completionRate: 0
      };
    }

    // Calculate current streak (working backwards from upToDate)
    let currentStreak = 0;
    let checkDate = new Date(upToDate);
    checkDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Convert upToDate to string for comparison
    const upToDateStr = upToDate;

    // Count backwards to find current streak
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (completedDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Check if we've gone past the first completion date
        const firstCompletionDate = new Date(completedDates[0]);
        firstCompletionDate.setHours(0, 0, 0, 0);
        
        if (checkDate < firstCompletionDate) {
          break; // We've gone past the first completion, streak is broken
        }
        break; // This day wasn't completed, streak is broken
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    // Sort completed dates
    const sortedCompletedDates = [...completedDates].sort();
    
    for (const dateStr of sortedCompletedDates) {
      const currentDate = new Date(dateStr);
      currentDate.setHours(0, 0, 0, 0);
      
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const dayDiff = Math.floor(
          (currentDate - prevDate) / (1000 * 60 * 60 * 24)
        );
        
        if (dayDiff === 1) {
          tempStreak++; // Consecutive day
        } else if (dayDiff > 1) {
          // Gap in streak, save the current streak and start new
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        } // If dayDiff === 0, it's the same day, shouldn't happen with unique dates
      }
      
      prevDate = currentDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate completion rate
    if (sortedCompletedDates.length > 0) {
      const firstCompletionDate = new Date(sortedCompletedDates[0]);
      const lastCompletionDate = new Date(sortedCompletedDates[sortedCompletedDates.length - 1]);
      const daysDiff = Math.floor(
        (lastCompletionDate - firstCompletionDate) / (1000 * 60 * 60 * 24)
      ) + 1;
      const completionRate = daysDiff > 0 
        ? Math.round((sortedCompletedDates.length / daysDiff) * 100)
        : 0;

      return {
        currentStreak,
        longestStreak,
        startDate: sortedCompletedDates[0],
        endDate: currentStreak > 0 ? upToDateStr : sortedCompletedDates[sortedCompletedDates.length - 1],
        lastCompletedDate: sortedCompletedDates[sortedCompletedDates.length - 1],
        totalCompletions: sortedCompletedDates.length,
        completionRate
      };
    } else {
      return {
        currentStreak: 0,
        longestStreak: 0,
        startDate: null,
        endDate: null,
        lastCompletedDate: null,
        totalCompletions: 0,
        completionRate: 0
      };
    }
  } catch (error) {
    console.error('Error calculating streak:', error);
    throw error;
  }
};

/**
 * Create snapshots for all active habits for a user
 */
const createDailySnapshotsForUser = async (userId, date) => {
  try {
    const habits = await Habit.find({ userId });
    const snapshots = [];

    for (const habit of habits) {
      const snapshot = await createStreakSnapshot(
        userId,
        habit._id,
        date
      );
      if (snapshot) {
        snapshots.push(snapshot);
      }
    }

    return snapshots;
  } catch (error) {
    console.error('Error creating daily snapshots:', error);
    throw error;
  }
};

/**
 * Archive streak when habit is deleted
 */
const archiveStreakOnHabitDeletion = async (userId, habitId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Create final snapshot
    const finalSnapshot = await createStreakSnapshot(userId, habitId, today);
    
    // Mark all previous snapshots as archived
    await StreakHistory.updateMany(
      { userId, habitId },
      {
        streakType: 'archived',
        isArchived: true,
        archivedAt: new Date()
      }
    );

    return finalSnapshot;
  } catch (error) {
    console.error('Error archiving streak:', error);
    throw error;
  }
};

module.exports = {
  createStreakSnapshot,
  calculateStreakForHabit,
  createDailySnapshotsForUser,
  archiveStreakOnHabitDeletion
};