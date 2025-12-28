const Habit = require('../models/Habit');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all habits for a user (including archived for historical views)
 * @route   GET /api/habits
 * @access  Private
 */
const getHabits = async (req, res) => {
  try {
    // Return ALL habits (active + archived) - frontend will filter based on selectedDate
    // This allows archived tasks to appear in historical views
    const habits = await Habit.find({ userId: req.user._id })
      .sort({ order: 1, createdAt: 1 });

    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new habit
 * @route   POST /api/habits
 * @access  Private
 */
const createHabit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, category, color, goal } = req.body;

  try {
    const habit = await Habit.create({
      userId: req.user._id,
      name,
      category: category || 'General',
      color: color || '#3b82f6',
      goal: goal || 'Daily'
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update habit
 * @route   PUT /api/habits/:id
 * @access  Private
 */
const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check if habit belongs to user
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { name, category, color, goal, isActive, order } = req.body;

    habit.name = name || habit.name;
    habit.category = category || habit.category;
    habit.color = color || habit.color;
    habit.goal = goal || habit.goal;
    habit.isActive = isActive !== undefined ? isActive : habit.isActive;
    habit.order = order !== undefined ? order : habit.order;

    const updatedHabit = await habit.save();

    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Archive habit (soft delete with date-scoping)
 * @route   DELETE /api/habits/:id
 * @access  Private
 * 
 * ARCHIVE LOGIC:
 * - Sets archivedAt to current date
 * - Task is hidden from this date onwards
 * - Task still appears in historical views (dates before archivedAt)
 * - Progress data is preserved
 */
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check if habit belongs to user
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // ARCHIVE: Set archivedAt to TODAY (not hard delete)
    // This preserves historical data while hiding from current/future views
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    habit.archivedAt = today;
    habit.isActive = false; // Also mark inactive for backwards compatibility
    await habit.save();

    res.json({ 
      message: 'Habit archived successfully',
      archivedAt: today
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit
};
