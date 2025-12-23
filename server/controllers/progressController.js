const Progress = require('../models/Progress');
const DailyProgress = require('../models/DailyProgress');
const Habit = require('../models/Habit');

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

    // Get all daily progress entries for this date
    const progress = await DailyProgress.find({
      userId: req.user._id,
      date
    });

    res.json({
      date,
      progress: progress.map(p => ({
        habitId: p.habitId,
        morning: p.morning,
        afternoon: p.afternoon,
        evening: p.evening,
        night: p.night
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
 * @desc    Get overall statistics
 * @route   GET /api/progress/stats
 * @access  Private
 */
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

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

module.exports = {
  getMonthlyProgress,
  toggleProgress,
  getStats,
  getDailyProgress,
  updateDailyProgress
};
