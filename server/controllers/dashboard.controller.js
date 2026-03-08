const { getUserStats, getUserRepos } = require('../services/github.service');
const { getUserInfo } = require('../services/codeforces.service');
const { getLeetCodeStats } = require('../services/leetcode.service');

// @desc    Get aggregated dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    const data = { github: null, codeforces: null, leetcode: null };

    const promises = [];

    // GitHub stats
    if (user.githubUsername) {
      promises.push(
        Promise.all([
          getUserStats(user.githubUsername, process.env.GITHUB_TOKEN),
          getUserRepos(user.githubUsername, process.env.GITHUB_TOKEN),
        ])
          .then(([stats, repos]) => {
            const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
            data.github = {
              username: stats.login,
              repos: stats.publicRepos,
              followers: stats.followers,
              totalStars,
              topLanguages: [...new Set(repos.map((r) => r.language).filter(Boolean))].slice(0, 5),
            };
          })
          .catch(() => {})
      );
    }

    // Codeforces stats
    if (user.codeforcesHandle) {
      promises.push(
        getUserInfo(user.codeforcesHandle)
          .then((info) => {
            data.codeforces = {
              handle: info.handle,
              rating: info.rating,
              maxRating: info.maxRating,
              rank: info.rank,
            };
          })
          .catch(() => {})
      );
    }

    // LeetCode stats
    if (user.leetcodeUsername) {
      promises.push(
        getLeetCodeStats(user.leetcodeUsername)
          .then((stats) => {
            data.leetcode = {
              username: stats.username,
              totalSolved: stats.solved.all,
              easy: stats.solved.easy,
              medium: stats.solved.medium,
              hard: stats.solved.hard,
              ranking: stats.ranking,
            };
          })
          .catch(() => {})
      );
    }

    await Promise.allSettled(promises);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardData };
