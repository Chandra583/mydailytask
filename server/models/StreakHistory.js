const mongoose = require('mongoose');

const streakHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  habitName: {
    type: String,
    required: true,
    // Store habit name so it's preserved even if habit is deleted
  },
  habitColor: {
    type: String,
    default: '#3b82f6'
  },
  habitCategory: {
    type: String,
    default: 'General'
  },
  streakType: {
    type: String,
    enum: ['active', 'ended', 'archived'],
    default: 'active'
    // active: currently ongoing streak
    // ended: streak was broken (user missed a day)
    // archived: user deleted the habit
  },
  currentStreak: {
    type: Number,
    default: 0,
    // Number of consecutive days
  },
  longestStreak: {
    type: Number,
    default: 0,
    // Historical best streak
  },
  startDate: {
    type: String,
    // YYYY-MM-DD format - when streak started
  },
  endDate: {
    type: String,
    // YYYY-MM-DD format - when streak ended (if ended)
  },
  lastCompletedDate: {
    type: String,
    // YYYY-MM-DD format - last day task was completed
  },
  totalCompletions: {
    type: Number,
    default: 0,
    // Total number of times task was completed
  },
  completionRate: {
    type: Number,
    default: 0,
    // Percentage: completions / total days
  },
  snapshotDate: {
    type: String,
    required: true,
    // YYYY-MM-DD format - when this snapshot was taken
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
streakHistorySchema.index({ userId: 1, habitId: 1, snapshotDate: -1 });
streakHistorySchema.index({ userId: 1, streakType: 1, currentStreak: -1 });

module.exports = mongoose.model('StreakHistory', streakHistorySchema);