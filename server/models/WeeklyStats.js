const mongoose = require('mongoose');

/**
 * Weekly Stats Schema
 * Caches weekly progress calculations for improved performance
 * Automatically expires after 1 hour to ensure data freshness
 */
const weeklyStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStart: {
    type: String, // YYYY-MM-DD format (Sunday)
    required: true
  },
  weekEnd: {
    type: String, // YYYY-MM-DD format (Saturday)
    required: true
  },
  days: [{
    date: String,
    dayName: String,
    progress: Number,
    isToday: Boolean
  }],
  weeklyAverage: {
    type: Number,
    default: 0
  },
  topHabits: [{
    name: String,
    color: String,
    completion: Number
  }],
  calculatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index for userId + weekStart
weeklyStatsSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

// TTL index - automatically delete documents older than 1 hour
// This ensures stale cache entries are cleaned up automatically
weeklyStatsSchema.index({ calculatedAt: 1 }, { expireAfterSeconds: 3600 });

/**
 * Static method to check if cache is still valid (less than 1 hour old)
 */
weeklyStatsSchema.statics.isCacheValid = function(calculatedAt) {
  if (!calculatedAt) return false;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return new Date(calculatedAt) > oneHourAgo;
};

module.exports = mongoose.model('WeeklyStats', weeklyStatsSchema);
