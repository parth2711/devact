const SyncData = require('../models/SyncData');
const { getUserStats, getUserRepos } = require('../services/github.service');
const { getUserInfo } = require('../services/codeforces.service');
const { getLeetCodeStats } = require('../services/leetcode.service');
const { syncUserData } = require('../services/sync.service');

// @desc    Get aggregated dashboard data (from cache, fallback to live)
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const user = req.user;

    // Try cache first
    const syncData = await SyncData.findOne({ userId: user._id });

    if (syncData && syncData.lastFullSync) {
      // Serve from cache
      const data = {
        github: null,
        codeforces: null,
        leetcode: null,
        wakatime: null,
        stackoverflow: null,
        packages: null,
        lastSyncedAt: syncData.lastFullSync,
      };

      if (syncData.github?.stats) {
        const totalStars = (syncData.github.repos || []).reduce((sum, r) => sum + (r.stars || 0), 0);
        data.github = {
          username: syncData.github.stats.login,
          repos: syncData.github.stats.publicRepos,
          followers: syncData.github.stats.followers,
          totalStars,
          topLanguages: [...new Set((syncData.github.repos || []).map((r) => r.language).filter(Boolean))].slice(0, 5),
        };
      }

      if (syncData.codeforces?.userInfo) {
        data.codeforces = {
          handle: syncData.codeforces.userInfo.handle,
          rating: syncData.codeforces.userInfo.rating,
          maxRating: syncData.codeforces.userInfo.maxRating,
          rank: syncData.codeforces.userInfo.rank,
        };
      }

      if (syncData.leetcode?.stats) {
        data.leetcode = {
          username: syncData.leetcode.stats.username,
          totalSolved: syncData.leetcode.stats.solved?.all || 0,
          easy: syncData.leetcode.stats.solved?.easy || 0,
          medium: syncData.leetcode.stats.solved?.medium || 0,
          hard: syncData.leetcode.stats.solved?.hard || 0,
          ranking: syncData.leetcode.stats.ranking || 0,
        };
      }

      if (syncData.wakatime?.totalSeconds > 0) {
        data.wakatime = syncData.wakatime;
      }

      if (syncData.stackoverflow?.reputation > 0) {
        data.stackoverflow = syncData.stackoverflow;
      }

      if (syncData.packages?.npm?.length > 0 || syncData.packages?.pypi?.length > 0) {
        data.packages = syncData.packages;
      }

      return res.json(data);
    }

    // No cache — try live fetch as fallback
    const data = { github: null, codeforces: null, leetcode: null, syncing: true };
    const promises = [];

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

    // New platforms live fetch (optional, but syncUserData handles it anyway)
    data.wakatime = null;
    data.stackoverflow = null;
    data.packages = null;

    // Initial sync context — await it so Vercel keeps the lambda alive
    try {
      const updatedSync = await syncUserData(user._id);
      if (updatedSync) {
        if (updatedSync.wakatime?.totalSeconds > 0) data.wakatime = updatedSync.wakatime;
        if (updatedSync.stackoverflow?.reputation > 0) data.stackoverflow = updatedSync.stackoverflow;
        if (updatedSync.packages?.npm?.length > 0 || updatedSync.packages?.pypi?.length > 0) data.packages = updatedSync.packages;
        data.lastSyncedAt = updatedSync.lastFullSync;
      }
    } catch (err) {
      console.error('[Dashboard] Initial sync failed:', err.message);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardData };
