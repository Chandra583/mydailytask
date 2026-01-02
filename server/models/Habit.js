const mongoose = require('mongoose');

/**
 * Habit Schema
 * Stores individual habit definitions
 */
const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a habit name'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  color: {
    type: String,
    default: '#3b82f6' // Blue default
  },
  goal: {
    type: String,
    default: 'Daily',
    enum: ['Daily', 'Weekly', 'Monthly']
  },
  // TASK TYPE: 'ongoing' (default) or 'daily' (one-time for specific day)
  // - ongoing: Shows every day from createdAt until archived
  // - daily: Only shows on the specific createdAt date
  taskType: {
    type: String,
    enum: ['ongoing', 'daily'],
    default: 'ongoing'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // ARCHIVE SUPPORT: When set, task is hidden from this date onwards
  // but still visible for historical dates before archivedAt
  archivedAt: {
    type: Date,
    default: null
  },
  // START DATE: The date from which this task should be visible
  // For ongoing tasks: shows from this date onwards
  // For daily tasks: shows ONLY on this date
  startDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  order: {
    type: Number,
    default: 0
  }
});

// Index for faster queries
habitSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Habit', habitSchema);
