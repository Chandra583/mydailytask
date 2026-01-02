const mongoose = require('mongoose');

/**
 * Monthly Stats Schema
 * Caches monthly progress calculations for improved performance
 * Includes heatmap data, top habits, and streak information
 */
const monthlyStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number, // 1-12
    required: true,
    min: 1,
    max: 12
  },
  daysInMonth: {
    type: Number,
    required: true
  },
  firstDayOfWeek: {
    type: Number, // 0 = Sunday, 6 = Saturday
    required: true
  },
  dailyProgress: [{
    date: String,
    day: Number,
    progress: Number,
    isToday: Boolean,
    hasData: Boolean
  }],
  monthlyAverage: {
    type: Number,
    default: 0
  },
  topHabitsMonthly: [{
    name: String,
    color: String,
    completion: Number,
    daysCompleted: Number
  }],
  longestStreak: {
    habitName: {
      type: String,
      default: 'None'
    },
    streakDays: {
      type: Number,
      default: 0
    }
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index for userId + year + month
monthlyStatsSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

// TTL index - automatically delete documents older than 1 hour
monthlyStatsSchema.index({ calculatedAt: 1 }, { expireAfterSeconds: 3600 });

/**
 * Static method to check if cache is still valid (less than 1 hour old)
 */
monthlyStatsSchema.statics.isCacheValid = function(calculatedAt) {
  if (!calculatedAt) return false;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return new Date(calculatedAt) > oneHourAgo;
};

module.exports = mongoose.model('MonthlyStats', monthlyStatsSchema);
