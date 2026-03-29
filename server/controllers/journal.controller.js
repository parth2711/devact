const JournalEntry = require('../models/JournalEntry');

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// @desc    Get recent journal entries (last 30)
// @route   GET /api/journal
// @access  Private
const getEntries = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const entries = await JournalEntry.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(limit)
      .lean();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's entry
// @route   GET /api/journal/today
// @access  Private
const getTodayEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ userId: req.user._id, date: todayStr() }).lean();
    res.json(entry || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update today's entry
// @route   PUT /api/journal/today
// @access  Private
const upsertTodayEntry = async (req, res) => {
  try {
    const { content, mood, tags } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Entry content cannot be empty.' });
    }

    const entry = await JournalEntry.findOneAndUpdate(
      { userId: req.user._id, date: todayStr() },
      { content: content.trim(), mood: mood || '', tags: tags || [] },
      { upsert: true, new: true }
    );

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete today's entry
// @route   DELETE /api/journal/today
// @access  Private
const deleteTodayEntry = async (req, res) => {
  try {
    await JournalEntry.findOneAndDelete({ userId: req.user._id, date: todayStr() });
    res.json({ message: 'Entry deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEntries, getTodayEntry, upsertTodayEntry, deleteTodayEntry };
