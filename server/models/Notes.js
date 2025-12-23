const mongoose = require('mongoose');

/**
 * Notes Schema
 * Stores monthly notes for users
 */
const notesSchema = new mongoose.Schema({
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
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  content: {
    type: String,
    default: '',
    maxlength: [5000, 'Notes cannot exceed 5000 characters']
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one note per user per month
notesSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Notes', notesSchema);
