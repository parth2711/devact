const { getUserInfo, getSubmissions, getRatingHistory } = require('../services/codeforces.service');
const { getLeetCodeStats } = require('../services/leetcode.service');

// @desc    Get Codeforces user stats
// @route   GET /api/cp/stats
// @access  Private
const getCPStats = async (req, res) => {
  try {
    const handle = req.user.codeforcesHandle;
    if (!handle) {
      return res.status(400).json({ message: 'Codeforces handle not set. Update your profile first.' });
    }

    const [userInfo, ratingHistory] = await Promise.all([
      getUserInfo(handle),
      getRatingHistory(handle),
    ]);

    res.json({ userInfo, ratingHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent Codeforces submissions
// @route   GET /api/cp/submissions
// @access  Private
const getCPSubmissions = async (req, res) => {
  try {
    const handle = req.user.codeforcesHandle;
    if (!handle) {
      return res.status(400).json({ message: 'Codeforces handle not set. Update your profile first.' });
    }

    const submissions = await getSubmissions(handle, 20);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get LeetCode stats
// @route   GET /api/cp/leetcode
// @access  Private
const getLeetCode = async (req, res) => {
  try {
    const username = req.user.leetcodeUsername;
    if (!username) {
      return res.status(400).json({ message: 'LeetCode username not set. Update your profile first.' });
    }

    const stats = await getLeetCodeStats(username);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCPStats, getCPSubmissions, getLeetCode };
