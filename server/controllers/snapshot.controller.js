const DailySnapshot = require('../models/DailySnapshot');

// @desc    Get snapshot history for logged-in user
// @route   GET /api/snapshots?days=30
// @access  Private
const getSnapshots = async (req, res) => {
  try {
    // Clamp days: Math.max(1, Math.min(days, 90))
    const rawDays = parseInt(req.query.days) || 30;
    const days = Math.max(1, Math.min(rawDays, 90));

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    const snapshots = await DailySnapshot.find({
      userId: req.user._id,
      date: { $gte: sinceStr },
    })
      .sort({ date: 1 })
      .lean();

    res.json({ snapshots, days });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSnapshots };
