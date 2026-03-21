const User = require('../models/User');
const SyncData = require('../models/SyncData');
const DailySnapshot = require('../models/DailySnapshot');
const { getUserStats, getUserRepos, getUserActivity } = require('./github.service');
const { getUserInfo, getSubmissions, getRatingHistory } = require('./codeforces.service');
const { getLeetCodeStats } = require('./leetcode.service');

/**
 * Sync all external API data for a single user and store in MongoDB.
 * Each platform is wrapped in its own try/catch for graceful partial failure.
 */
async function syncUserData(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Get existing sync data or create empty
  let syncData = await SyncData.findOne({ userId });
  if (!syncData) {
    syncData = new SyncData({ userId });
  }

  const now = new Date();

  // --- GitHub ---
  if (user.githubUsername) {
    try {
      const token = process.env.GITHUB_TOKEN;
      const [stats, repos, activity] = await Promise.all([
        getUserStats(user.githubUsername, token),
        getUserRepos(user.githubUsername, token),
        getUserActivity(user.githubUsername, token),
      ]);
      syncData.github = { stats, repos, activity, lastSyncedAt: now };
    } catch (err) {
      console.error(`[Sync] GitHub failed for ${user.githubUsername}:`, err.message);
    }
  }

  // --- Codeforces ---
  if (user.codeforcesHandle) {
    try {
      const [userInfo, submissions, ratingHistory] = await Promise.all([
        getUserInfo(user.codeforcesHandle),
        getSubmissions(user.codeforcesHandle, 20),
        getRatingHistory(user.codeforcesHandle),
      ]);
      syncData.codeforces = { userInfo, submissions, ratingHistory, lastSyncedAt: now };
    } catch (err) {
      console.error(`[Sync] Codeforces failed for ${user.codeforcesHandle}:`, err.message);
    }
  }

  // --- LeetCode ---
  if (user.leetcodeUsername) {
    try {
      const stats = await getLeetCodeStats(user.leetcodeUsername);
      syncData.leetcode = { stats, lastSyncedAt: now };
    } catch (err) {
      console.error(`[Sync] LeetCode failed for ${user.leetcodeUsername}:`, err.message);
    }
  }

  syncData.lastFullSync = now;
  await syncData.save();

  // Save daily snapshot
  await saveDailySnapshot(userId, syncData);

  console.log(`[Sync] Completed for user ${user.name} (${userId})`);
  return syncData;
}

/**
 * Save a daily snapshot. Uses compound key { userId, date } for dedup.
 * One snapshot per user per day — subsequent syncs on the same day update it.
 */
async function saveDailySnapshot(userId, syncData) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const snapshotData = {
    userId,
    date: today,
    github: {
      repos: syncData.github?.stats?.publicRepos || 0,
      stars: syncData.github?.repos?.reduce((sum, r) => sum + (r.stars || 0), 0) || 0,
      followers: syncData.github?.stats?.followers || 0,
    },
    codeforces: {
      rating: syncData.codeforces?.userInfo?.rating || 0,
      maxRating: syncData.codeforces?.userInfo?.maxRating || 0,
      rank: syncData.codeforces?.userInfo?.rank || 'Unrated',
    },
    leetcode: {
      totalSolved: syncData.leetcode?.stats?.solved?.all || 0,
      easy: syncData.leetcode?.stats?.solved?.easy || 0,
      medium: syncData.leetcode?.stats?.solved?.medium || 0,
      hard: syncData.leetcode?.stats?.solved?.hard || 0,
      ranking: syncData.leetcode?.stats?.ranking || 0,
    },
  };

  try {
    await DailySnapshot.findOneAndUpdate(
      { userId, date: today },
      snapshotData,
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`[Snapshot] Failed for user ${userId}:`, err.message);
  }
}

module.exports = { syncUserData };
