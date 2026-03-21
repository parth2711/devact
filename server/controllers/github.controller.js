const SyncData = require('../models/SyncData');
const { getUserRepos, getUserActivity, getUserStats } = require('../services/github.service');

// @desc    Get GitHub repositories (from cache)
// @route   GET /api/github/repos
// @access  Private
const getGithubRepos = async (req, res) => {
  try {
    const username = req.user.githubUsername;
    if (!username) {
      return res.status(400).json({ message: 'GitHub username not set. Update your profile first.' });
    }

    const syncData = await SyncData.findOne({ userId: req.user._id });
    if (syncData?.github?.repos) {
      return res.json(syncData.github.repos);
    }

    // Fallback to live
    const repos = await getUserRepos(username, process.env.GITHUB_TOKEN);
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent GitHub activity (from cache)
// @route   GET /api/github/activity
// @access  Private
const getGithubActivity = async (req, res) => {
  try {
    const username = req.user.githubUsername;
    if (!username) {
      return res.status(400).json({ message: 'GitHub username not set. Update your profile first.' });
    }

    const syncData = await SyncData.findOne({ userId: req.user._id });
    if (syncData?.github?.activity) {
      return res.json(syncData.github.activity);
    }

    const activity = await getUserActivity(username, process.env.GITHUB_TOKEN);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get GitHub profile stats (from cache)
// @route   GET /api/github/stats
// @access  Private
const getGithubStats = async (req, res) => {
  try {
    const username = req.user.githubUsername;
    if (!username) {
      return res.status(400).json({ message: 'GitHub username not set. Update your profile first.' });
    }

    const syncData = await SyncData.findOne({ userId: req.user._id });
    if (syncData?.github?.stats) {
      return res.json(syncData.github.stats);
    }

    const stats = await getUserStats(username, process.env.GITHUB_TOKEN);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGithubRepos, getGithubActivity, getGithubStats };
