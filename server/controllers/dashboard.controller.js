// @desc    Get aggregated dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  // TODO: Aggregate data from GitHub, CP, and repo sources
  res.json({ message: 'Dashboard data endpoint — coming soon' });
};

module.exports = { getDashboardData };
