const Notes = require('../models/Notes');

/**
 * @desc    Get notes for a specific month
 * @route   GET /api/notes/:year/:month
 * @access  Private
 */
const getNotes = async (req, res) => {
  try {
    const { year, month } = req.params;

    let notes = await Notes.findOne({
      userId: req.user._id,
      year: parseInt(year),
      month: parseInt(month)
    });

    // If notes don't exist, create empty notes
    if (!notes) {
      notes = {
        userId: req.user._id,
        year: parseInt(year),
        month: parseInt(month),
        content: '',
        updatedAt: new Date()
      };
    }

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update notes for a specific month
 * @route   PUT /api/notes/:year/:month
 * @access  Private
 */
const updateNotes = async (req, res) => {
  try {
    const { year, month } = req.params;
    const { content } = req.body;

    // Find existing notes or create new
    let notes = await Notes.findOne({
      userId: req.user._id,
      year: parseInt(year),
      month: parseInt(month)
    });

    if (notes) {
      // Update existing notes
      notes.content = content;
      notes.updatedAt = new Date();
      await notes.save();
    } else {
      // Create new notes
      notes = await Notes.create({
        userId: req.user._id,
        year: parseInt(year),
        month: parseInt(month),
        content,
        updatedAt: new Date()
      });
    }

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotes,
  updateNotes
};
