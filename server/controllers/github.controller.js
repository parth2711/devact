const { getUserRepos, getUserActivity, getUserStats } = require('../services/github.service');

// @desc    Get GitHub repositories for authenticated user
// @route   GET /api/github/repos
// @access  Private
const getGithubRepos = async (req, res) => {
  try {
    const username = req.user.githubUsername;
    if (!username) {
      return res.status(400).json({ message: 'GitHub username not set. Update your profile first.' });
    }

    const repos = await getUserRepos(username, process.env.GITHUB_TOKEN);
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent GitHub activity for authenticated user
// @route   GET /api/github/activity
// @access  Private
const getGithubActivity = async (req, res) => {
  try {
    const username = req.user.githubUsername;
    if (!username) {
      return res.status(400).json({ message: 'GitHub username not set. Update your profile first.' });
    }

    const activity = await getUserActivity(username, process.env.GITHUB_TOKEN);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get GitHub profile stats for authenticated user
// @route   GET /api/github/stats
// @access  Private
const getGithubStats = async (req, res) => {
  try {
    const username = req.user.githubUsername;
    if (!username) {
      return res.status(400).json({ message: 'GitHub username not set. Update your profile first.' });
    }

    const stats = await getUserStats(username, process.env.GITHUB_TOKEN);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGithubRepos, getGithubActivity, getGithubStats };
