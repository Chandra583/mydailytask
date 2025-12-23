const mongoose = require('mongoose');

/**
 * Daily Progress Schema
 * Tracks habit completion by time period (morning, afternoon, evening, night)
 * with percentage-based completion (0, 10, 20, 50, 80, 100)
 */
const dailyProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  morning: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  afternoon: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  evening: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  night: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one entry per habit per day per user
dailyProgressSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

// Update timestamp on save
dailyProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);
