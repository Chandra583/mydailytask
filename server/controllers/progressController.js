const Progress = require('../models/Progress');
const DailyProgress = require('../models/DailyProgress');
const Habit = require('../models/Habit');
const WeeklyStats = require('../models/WeeklyStats');
const MonthlyStats = require('../models/MonthlyStats');
const { createStreakSnapshot } = require('../services/streakSnapshotService');

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 60 * 60 * 1000;

/**
 * @desc    Get monthly progress data
 * @route   GET /api/progress/:year/:month
 * @access  Private
 */
const getMonthlyProgress = async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get all active habits for user
    const habits = await Habit.find({ 
      userId: req.user._id, 
      isActive: true 
    }).sort({ order: 1, createdAt: 1 });

    // Get all progress entries for the month
    const progressData = await Progress.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Get days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    res.json({
      habits,
      progressData,
      daysInMonth,
      year: parseInt(year),
      month: parseInt(month)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Toggle habit completion for a specific date
 * @route   POST /api/progress/toggle
 * @access  Private
 */
const toggleProgress = async (req, res) => {
  try {
    const { habitId, date } = req.body;

    if (!habitId || !date) {
      return res.status(400).json({ 
        message: 'Habit ID and date are required' 
      });
    }

    // Verify habit belongs to user
    const habit = await Habit.findOne({ 
      _id: habitId, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Normalize date to start of day
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    // Check if progress entry exists
    let progress = await Progress.findOne({
      userId: req.user._id,
      habitId,
      date: normalizedDate
    });

    if (progress) {
      // Toggle completion status
      progress.completed = !progress.completed;
      await progress.save();
    } else {
      // Create new progress entry
      progress = await Progress.create({
        userId: req.user._id,
        habitId,
        date: normalizedDate,
        completed: true
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get daily progress for a specific date
 * @route   GET /api/progress/daily/:date
 * @access  Private
 * 
 * CRITICAL: This endpoint NEVER copies data from previous days.
 * If no progress exists for the requested date, it returns an empty array.
 * Frontend is responsible for initializing fresh progress (all zeros).
 */
const getDailyProgress = async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Get ONLY progress entries for THIS SPECIFIC DATE
    // DO NOT fetch or copy from any other date
    const progress = await DailyProgress.find({
      userId: req.user._id,
      date: date  // Exact match - no date range, no fallback
    });

    // Return what exists for this date (empty array if nothing)
    // Frontend will initialize zeros for habits without progress
    res.json({
      date,
      isNewDay: progress.length === 0,  // Flag to help frontend know this is fresh
      progress: progress.map(p => ({
        habitId: p.habitId,
        morning: p.morning || 0,
        afternoon: p.afternoon || 0,
        evening: p.evening || 0,
        night: p.night || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update habit progress for a time period
 * @route   POST /api/progress/daily
 * @access  Private
 */
const updateDailyProgress = async (req, res) => {
  try {
    const { habitId, date, timePeriod, percentage } = req.body;

    // Validate inputs
    if (!habitId || !date || !timePeriod || percentage === undefined) {
      return res.status(400).json({ 
        message: 'habitId, date, timePeriod, and percentage are required' 
      });
    }

    // Validate time period
    const validPeriods = ['morning', 'afternoon', 'evening', 'night'];
    if (!validPeriods.includes(timePeriod)) {
      return res.status(400).json({ 
        message: 'Invalid time period. Use: morning, afternoon, evening, or night' 
      });
    }

    // Validate percentage
    const validPercentages = [0, 10, 20, 50, 80, 100];
    if (!validPercentages.includes(percentage)) {
      return res.status(400).json({ 
        message: 'Invalid percentage. Use: 0, 10, 20, 50, 80, or 100' 
      });
    }

    // Verify habit belongs to user
    const habit = await Habit.findOne({ 
      _id: habitId, 
      userId: req.user._id 
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Find or create daily progress entry
    let dailyProgress = await DailyProgress.findOne({
      userId: req.user._id,
      habitId,
      date
    });

    if (dailyProgress) {
      // Update existing entry
      dailyProgress[timePeriod] = percentage;
      await dailyProgress.save();
    } else {
      // Create new entry
      dailyProgress = await DailyProgress.create({
        userId: req.user._id,
        habitId,
        date,
        [timePeriod]: percentage
      });
    }

    // ALSO update legacy Progress model for streak calculation
    const isCompleted = percentage === 100;
    await Progress.findOneAndUpdate(
      { 
        userId: req.user._id, 
        habitId, 
        date: new Date(date) 
      },
      { 
        completed: isCompleted,
        userId: req.user._id,
        habitId,
        date: new Date(date)
      },
      { upsert: true }
    );
    
    // CREATE/UPDATE STREAK SNAPSHOT when task is completed
    if (isCompleted) {
      await createStreakSnapshot(req.user._id, habitId, date);
    }
    
    res.json({
      habitId: dailyProgress.habitId,
      date: dailyProgress.date,
      morning: dailyProgress.morning,
      afternoon: dailyProgress.afternoon,
      evening: dailyProgress.evening,
      night: dailyProgress.night
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper: Get today's date key in LOCAL timezone (YYYY-MM-DD)
 * CRITICAL: Must match frontend's getTodayDateKey() exactly
 */
const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Helper: Add days to a date string
 */
const addDays = (dateStr, days) => {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
};

/**
 * Helper: Get start of week (Sunday) for a given date
 */
const getStartOfWeek = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay(); // 0 = Sunday
  date.setDate(date.getDate() - day);
  return getLocalDateKey(date);
};

/**
 * Helper: Get last day of month
 */
const getLastDayOfMonth = (year, month) => {
  const date = new Date(year, month, 0); // Month is 1-indexed here, 0 gives last day of previous month
  return getLocalDateKey(date);
};

/**
 * @desc    Get overall statistics
 * @route   GET /api/progress/stats
 * @access  Private
 * 
 * CRITICAL: Uses LOCAL timezone date, not UTC.
 * This ensures stats match the user's actual day.
 */
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    // FIXED: Use local timezone, NOT UTC (toISOString uses UTC)
    const today = getLocalDateKey(now);

    // Get active habits count
    const totalHabits = await Habit.countDocuments({ 
      userId: req.user._id, 
      isActive: true 
    });

    // Get today's daily progress
    const todayProgress = await DailyProgress.find({
      userId: req.user._id,
      date: today
    });

    // Calculate daily stats by time period
    let morningTotal = 0, afternoonTotal = 0, eveningTotal = 0, nightTotal = 0;
    let completed = 0;

    todayProgress.forEach(p => {
      morningTotal += p.morning || 0;
      afternoonTotal += p.afternoon || 0;
      eveningTotal += p.evening || 0;
      nightTotal += p.night || 0;
      
      if (p.morning === 100) completed++;
      if (p.afternoon === 100) completed++;
      if (p.evening === 100) completed++;
      if (p.night === 100) completed++;
    });

    const habitCount = totalHabits || 1;
    const overallProgress = (morningTotal + afternoonTotal + eveningTotal + nightTotal) / (habitCount * 4);

    res.json({
      totalHabits,
      overallProgress: Math.round(overallProgress),
      morningProgress: Math.round(morningTotal / habitCount),
      afternoonProgress: Math.round(afternoonTotal / habitCount),
      eveningProgress: Math.round(eveningTotal / habitCount),
      nightProgress: Math.round(nightTotal / habitCount),
      completed,
      remaining: (totalHabits * 4) - completed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get weekly progress overview
 * @route   GET /api/progress/weekly/:weekStart
 * @access  Private
 * 
 * Returns progress data for a 7-day week starting from weekStart (Sunday)
 * Uses caching for improved performance (1 hour TTL)
 */
const getWeeklyProgress = async (req, res) => {
  try {
    const { weekStart } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    const today = getLocalDateKey();
    const weekEnd = addDays(weekStart, 6);
    
    // Check if this is a historical week (not containing today)
    // Only cache historical weeks since current week data changes frequently
    const isHistoricalWeek = weekEnd < today;

    // Try to get cached data for historical weeks
    if (isHistoricalWeek) {
      try {
        const cached = await WeeklyStats.findOne({
          userId: req.user._id,
          weekStart
        });

        if (cached && WeeklyStats.isCacheValid(cached.calculatedAt)) {
          // Return cached data (update isToday flag since it might have changed)
          const cachedData = cached.toObject();
          cachedData.days = cachedData.days.map(d => ({
            ...d,
            isToday: d.date === today
          }));
          return res.json(cachedData);
        }
      } catch (cacheError) {
        // Cache lookup failed, continue with fresh calculation
        console.warn('Weekly cache lookup failed:', cacheError.message);
      }
    }

    // Get all ACTIVE habits for user (exclude archived)
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true
    });

    // Get all progress entries for the week
    const progressData = await DailyProgress.find({
      userId: req.user._id,
      date: { $gte: weekStart, $lte: weekEnd }
    });

    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Build daily progress for each day of the week
    // GOLDEN RULE: A task is COMPLETE if ANY period = 100%
    // Daily progress = (completed tasks / total tasks) * 100
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = addDays(weekStart, i);
      const dayProgress = progressData.filter(p => p.date === dateStr);
      
      // #region agent log
      const fs = require('fs');
      fs.appendFileSync('c:\\Users\\Chandrashekar\\Desktop\\habittracker\\.cursor\\debug.log', JSON.stringify({location:'progressController.js:419',message:'Processing day in weekly overview',data:{dateStr,isToday:dateStr===today,dayProgressCount:dayProgress.length,totalHabits:habits.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'}) + '\n');
      // #endregion
      
      // Count tasks completed (ANY period = 100%)
      let completedTasks = 0;
      
      dayProgress.forEach(p => {
        // A task is complete if ANY period is 100%
        if ((p.morning || 0) === 100 || 
            (p.afternoon || 0) === 100 || 
            (p.evening || 0) === 100 || 
            (p.night || 0) === 100) {
          completedTasks++;
          // #region agent log
          if (dateStr === today) {
            fs.appendFileSync('c:\\Users\\Chandrashekar\\Desktop\\habittracker\\.cursor\\debug.log', JSON.stringify({location:'progressController.js:435',message:'TODAY task marked complete in backend',data:{habitId:p.habitId.toString(),dateStr,morning:p.morning,afternoon:p.afternoon,evening:p.evening,night:p.night},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'}) + '\n');
          }
          // #endregion
        }
      });
      
      // Progress = percentage of completed tasks out of total habits
      // Use total habits count, not just habits with progress on this day
      const totalTasks = habits.length;
      const dayCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // #region agent log
      if (dateStr === today) {
        fs.appendFileSync('c:\\Users\\Chandrashekar\\Desktop\\habittracker\\.cursor\\debug.log', JSON.stringify({location:'progressController.js:451',message:'TODAY backend calculation result',data:{dateStr,completedTasks,totalTasks,dayCompletionPercent},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'}) + '\n');
      }
      // #endregion
      
      days.push({
        date: dateStr,
        dayName: dayNames[i],
        progress: dayCompletionPercent,
        completedTasks,
        totalTasks,
        isToday: dateStr === today
      });
    }

    // Calculate weekly average
    const weeklyAverage = days.reduce((sum, d) => sum + d.progress, 0) / 7;

    // Calculate top 5 habits for the week
    // GOLDEN RULE: Count days where habit was completed (ANY period = 100%)
    const habitStats = {};
    habits.forEach(h => {
      habitStats[h._id.toString()] = {
        name: h.name,
        color: h.color,
        daysCompleted: 0,  // Days where ANY period = 100%
        totalDays: 7
      };
    });

    progressData.forEach(p => {
      const habitId = p.habitId.toString();
      if (habitStats[habitId]) {
        // Count as completed if ANY period = 100%
        if ((p.morning || 0) === 100 || 
            (p.afternoon || 0) === 100 || 
            (p.evening || 0) === 100 || 
            (p.night || 0) === 100) {
          habitStats[habitId].daysCompleted++;
        }
      }
    });

    const topHabits = Object.values(habitStats)
      .map(h => ({
        name: h.name,
        color: h.color,
        completion: Math.round((h.daysCompleted / h.totalDays) * 100)
      }))
      .sort((a, b) => b.completion - a.completion)
      .slice(0, 5);

    const result = {
      weekStart,
      weekEnd,
      days,
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
      topHabits
    };

    // Cache historical weeks for future requests
    if (isHistoricalWeek) {
      try {
        await WeeklyStats.findOneAndUpdate(
          { userId: req.user._id, weekStart },
          { ...result, userId: req.user._id, calculatedAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (cacheError) {
        // Cache save failed, log but don't fail the request
        console.warn('Weekly cache save failed:', cacheError.message);
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get monthly progress overview with heatmap data
 * @route   GET /api/progress/monthly-overview/:year/:month
 * @access  Private
 * 
 * Uses caching for improved performance (1 hour TTL for past months)
 */
const getMonthlyOverview = async (req, res) => {
  try {
    const { year, month } = req.params;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    // Validate
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: 'Invalid year or month' });
    }

    const today = getLocalDateKey();
    const todayDate = new Date();
    const currentYear = todayDate.getFullYear();
    const currentMonth = todayDate.getMonth() + 1;
    
    // Check if this is a past month (not the current month)
    // Only cache past months since current month data changes frequently
    const isPastMonth = (yearNum < currentYear) || 
                        (yearNum === currentYear && monthNum < currentMonth);

    // Try to get cached data for past months
    if (isPastMonth) {
      try {
        const cached = await MonthlyStats.findOne({
          userId: req.user._id,
          year: yearNum,
          month: monthNum
        });

        if (cached && MonthlyStats.isCacheValid(cached.calculatedAt)) {
          // Return cached data (update isToday flags)
          const cachedData = cached.toObject();
          cachedData.dailyProgress = cachedData.dailyProgress.map(d => ({
            ...d,
            isToday: d.date === today
          }));
          return res.json(cachedData);
        }
      } catch (cacheError) {
        // Cache lookup failed, continue with fresh calculation
        console.warn('Monthly cache lookup failed:', cacheError.message);
      }
    }

    // Get date range for the month
    const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    // Get all habits
    const habits = await Habit.find({ userId: req.user._id });

    // Get all progress for the month
    const progressData = await DailyProgress.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Build daily progress for heatmap
    // GOLDEN RULE: A task is COMPLETE if ANY period = 100%
    // Daily progress = (completed tasks / total tasks) * 100
    const dailyProgress = [];
    const totalTasks = habits.length;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayProgress = progressData.filter(p => p.date === dateStr);
      
      // Count tasks completed (ANY period = 100%)
      let completedTasks = 0;
      
      dayProgress.forEach(p => {
        // A task is complete if ANY period is 100%
        if ((p.morning || 0) === 100 || 
            (p.afternoon || 0) === 100 || 
            (p.evening || 0) === 100 || 
            (p.night || 0) === 100) {
          completedTasks++;
        }
      });
      
      // Progress = percentage of completed tasks out of total habits
      const dayCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      dailyProgress.push({
        date: dateStr,
        day,
        progress: dayCompletionPercent,
        completedTasks,
        totalTasks,
        isToday: dateStr === today,
        hasData: dayProgress.length > 0
      });
    }

    // Calculate monthly average (only days with data)
    const daysWithData = dailyProgress.filter(d => d.hasData);
    const monthlyAverage = daysWithData.length > 0 
      ? daysWithData.reduce((sum, d) => sum + d.progress, 0) / daysWithData.length 
      : 0;

    // Calculate top 5 habits for the month
    // GOLDEN RULE: Count days where habit was completed (ANY period = 100%)
    const habitStats = {};
    habits.forEach(h => {
      habitStats[h._id.toString()] = {
        name: h.name,
        color: h.color,
        daysCompleted: 0,  // Days where ANY period = 100%
        totalDays: daysInMonth
      };
    });

    progressData.forEach(p => {
      const habitId = p.habitId.toString();
      if (habitStats[habitId]) {
        // Count as completed if ANY period = 100%
        if ((p.morning || 0) === 100 || 
            (p.afternoon || 0) === 100 || 
            (p.evening || 0) === 100 || 
            (p.night || 0) === 100) {
          habitStats[habitId].daysCompleted++;
        }
      }
    });

    const topHabitsMonthly = Object.values(habitStats)
      .map(h => ({
        name: h.name,
        color: h.color,
        completion: Math.round((h.daysCompleted / h.totalDays) * 100),
        daysCompleted: h.daysCompleted
      }))
      .sort((a, b) => b.completion - a.completion)
      .slice(0, 5);

    // Calculate longest streak in the month
    // GOLDEN RULE: A day counts toward streak if ANY period = 100%
    let longestStreak = { habitName: 'None', streakDays: 0 };
    
    habits.forEach(habit => {
      let currentStreak = 0;
      let maxStreak = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayProgress = progressData.find(
          p => p.date === dateStr && p.habitId.toString() === habit._id.toString()
        );
        
        if (dayProgress) {
          // Check if ANY period is 100%
          if ((dayProgress.morning || 0) === 100 || 
              (dayProgress.afternoon || 0) === 100 || 
              (dayProgress.evening || 0) === 100 || 
              (dayProgress.night || 0) === 100) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        } else {
          currentStreak = 0;
        }
      }
      
      if (maxStreak > longestStreak.streakDays) {
        longestStreak = { habitName: habit.name, streakDays: maxStreak };
      }
    });

    // Get first day of month's weekday (0 = Sunday)
    const firstDayOfWeek = new Date(yearNum, monthNum - 1, 1).getDay();

    const result = {
      month: monthNum,
      year: yearNum,
      daysInMonth,
      firstDayOfWeek,
      monthlyAverage: Math.round(monthlyAverage * 10) / 10,
      dailyProgress,
      topHabitsMonthly,
      longestStreak
    };

    // Cache past months for future requests
    if (isPastMonth) {
      try {
        await MonthlyStats.findOneAndUpdate(
          { userId: req.user._id, year: yearNum, month: monthNum },
          { ...result, userId: req.user._id, calculatedAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (cacheError) {
        // Cache save failed, log but don't fail the request
        console.warn('Monthly cache save failed:', cacheError.message);
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMonthlyProgress,
  toggleProgress,
  getStats,
  getDailyProgress,
  updateDailyProgress,
  getWeeklyProgress,
  getMonthlyOverview
};
