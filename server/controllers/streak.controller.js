const { getStreakData } = require('../services/streak.service');

// @desc    Get unified coding streak for current user
// @route   GET /api/streak
// @access  Private
const getStreak = async (req, res) => {
  try {
    const data = await getStreakData(req.user._id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStreak };
