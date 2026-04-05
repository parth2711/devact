const User          = require('../models/User');
const SyncData      = require('../models/SyncData');
const DailySnapshot = require('../models/DailySnapshot');

function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function computeStreak(userId) {
  const snapshots = await DailySnapshot.find({ userId }).sort({ date: 1 }).lean();
  if (snapshots.length < 2) return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };

  const activeDates = new Set();
  for (let i = 1; i < snapshots.length; i++) {
    const p = snapshots[i - 1], c = snapshots[i];
    if (
      c.leetcode?.totalSolved > p.leetcode?.totalSolved ||
      c.codeforces?.rating   !== p.codeforces?.rating  ||
      c.github?.stars        > p.github?.stars
    ) activeDates.add(c.date);
  }

  const today     = localDateStr(new Date());
  const yesterday = localDateStr(new Date(Date.now() - 86400000));

  // Current streak
  let currentStreak = 0;
  const start = activeDates.has(today) ? today : activeDates.has(yesterday) ? yesterday : null;
  if (start) {
    let cursor = new Date(start + 'T12:00:00');
    while (activeDates.has(localDateStr(cursor))) {
      currentStreak++;
      cursor = new Date(cursor.getTime() - 86400000);
    }
  }

  // Longest streak
  let longest = 0, temp = 0, prev = null;
  for (const d of Array.from(activeDates).sort()) {
    const curr = new Date(d + 'T12:00:00');
    temp = (prev && (curr - prev) / 86400000 === 1) ? temp + 1 : 1;
    longest = Math.max(longest, temp);
    prev = curr;
  }

  return { currentStreak, longestStreak: longest, totalActiveDays: activeDates.size };
}

// @desc    Get public user profile
// @route   GET /api/u/:username
// @access  Public
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user)                 return res.status(404).json({ message: 'User not found' });
    if (!user.isPublicProfile) return res.status(403).json({ private: true });

    const sinceStr = localDateStr(new Date(Date.now() - 30 * 86400000));

    const [syncData, snapshots, streak] = await Promise.all([
      SyncData.findOne({ userId: user._id }),
      DailySnapshot.find({ userId: user._id, date: { $gte: sinceStr } }).sort({ date: 1 }).lean(),
      computeStreak(user._id),
    ]);

    const profile = {
      name: user.name, username: user.username, avatar: user.avatar,
      github: null, codeforces: null, leetcode: null,
      wakatime: null, stackoverflow: null, packages: null,
      streak, snapshots,
    };

    if (syncData?.github?.stats) {
      profile.github = {
        username: syncData.github.stats.login,
        repos:    syncData.github.stats.publicRepos,
        followers: syncData.github.stats.followers,
        totalStars: (syncData.github.repos || []).reduce((s, r) => s + (r.stars || 0), 0),
        topLanguages: [...new Set((syncData.github.repos || []).map(r => r.language).filter(Boolean))].slice(0, 6),
      };
    }
    if (syncData?.codeforces?.userInfo) {
      const u = syncData.codeforces.userInfo;
      profile.codeforces = { handle: u.handle, rating: u.rating, maxRating: u.maxRating, rank: u.rank };
    }
    if (syncData?.leetcode?.stats) {
      const s = syncData.leetcode.stats;
      profile.leetcode = {
        username: s.username, totalSolved: s.solved?.all || 0,
        easy: s.solved?.easy || 0, medium: s.solved?.medium || 0,
        hard: s.solved?.hard || 0, ranking: s.ranking || 0,
      };
    }
    if (syncData?.wakatime?.totalSeconds > 0)                                         profile.wakatime      = syncData.wakatime;
    if (syncData?.stackoverflow?.reputation > 0)                                      profile.stackoverflow = syncData.stackoverflow;
    if (syncData?.packages?.npm?.length > 0 || syncData?.packages?.pypi?.length > 0) profile.packages      = syncData.packages;

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPublicProfile };
