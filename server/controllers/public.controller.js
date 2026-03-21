const User = require('../models/User');
const SyncData = require('../models/SyncData');
const DailySnapshot = require('../models/DailySnapshot');

// @desc    Get public user profile
// @route   GET /api/u/:username
// @access  Public (no auth)
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isPublicProfile) {
      return res.status(403).json({ private: true, message: 'This profile is private' });
    }

    // Get synced data
    const syncData = await SyncData.findOne({ userId: user._id });

    // Get last 30 days of snapshots
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceStr = since.toISOString().split('T')[0];

    const snapshots = await DailySnapshot.find({
      userId: user._id,
      date: { $gte: sinceStr },
    })
      .sort({ date: 1 })
      .lean();

    const profile = {
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      github: null,
      codeforces: null,
      leetcode: null,
      wakatime: null,
      stackoverflow: null,
      packages: null,
      snapshots,
    };

    if (syncData?.github?.stats) {
      const totalStars = (syncData.github.repos || []).reduce((sum, r) => sum + (r.stars || 0), 0);
      profile.github = {
        username: syncData.github.stats.login,
        repos: syncData.github.stats.publicRepos,
        followers: syncData.github.stats.followers,
        totalStars,
        topLanguages: [...new Set((syncData.github.repos || []).map((r) => r.language).filter(Boolean))].slice(0, 5),
      };
    }

    if (syncData?.codeforces?.userInfo) {
      profile.codeforces = {
        handle: syncData.codeforces.userInfo.handle,
        rating: syncData.codeforces.userInfo.rating,
        maxRating: syncData.codeforces.userInfo.maxRating,
        rank: syncData.codeforces.userInfo.rank,
      };
    }

    if (syncData?.leetcode?.stats) {
      profile.leetcode = {
        username: syncData.leetcode.stats.username,
        totalSolved: syncData.leetcode.stats.solved?.all || 0,
        easy: syncData.leetcode.stats.solved?.easy || 0,
        medium: syncData.leetcode.stats.solved?.medium || 0,
        hard: syncData.leetcode.stats.solved?.hard || 0,
        ranking: syncData.leetcode.stats.ranking || 0,
      };
    }

    if (syncData?.wakatime?.totalSeconds > 0) {
      profile.wakatime = syncData.wakatime;
    }

    if (syncData?.stackoverflow?.reputation > 0) {
      profile.stackoverflow = syncData.stackoverflow;
    }

    if (syncData?.packages?.npm?.length > 0 || syncData?.packages?.pypi?.length > 0) {
      profile.packages = syncData.packages;
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPublicProfile };
