const mongoose = require('mongoose');

/**
 * Progress Schema
 * Tracks daily habit completion
 */
const progressSchema = new mongoose.Schema({
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
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one entry per habit per day
progressSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
