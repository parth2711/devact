const User = require('../models/User');
const SyncData = require('../models/SyncData');
const DailySnapshot = require('../models/DailySnapshot');
const { getUserStats, getUserRepos, getUserActivity } = require('./github.service');
const { getUserInfo, getSubmissions, getRatingHistory, getFailedProblems } = require('./codeforces.service');
const { getLeetCodeStats, getRecentFailedSubmissions, getRecentSubmissions } = require('./leetcode.service');
const { getWakatimeStats } = require('./wakatime.service');
const { getStackOverflowStats } = require('./stackoverflow.service');
const { getPackageStats } = require('./packages.service');

const API_TIMEOUT_MS = 12000;

function withTimeout(promise, ms = API_TIMEOUT_MS, label = 'API call') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`${label} timed out after ${ms}ms`));
      }, ms);
      if (timer.unref) timer.unref();
    }),
  ]);
}

async function syncUserData(userId) {
  const user = await User.findById(userId).select('+wakatimeApiKey');
  if (!user) throw new Error('User not found');

  let syncData = await SyncData.findOne({ userId });
  if (!syncData) {
    syncData = new SyncData({ userId });
  }

  const now = new Date();

  if (user.githubUsername) {
    try {
      const token = process.env.GITHUB_TOKEN;
      const [stats, repos, activity] = await Promise.all([
        withTimeout(getUserStats(user.githubUsername, token), API_TIMEOUT_MS, 'GitHub stats'),
        withTimeout(getUserRepos(user.githubUsername, token), API_TIMEOUT_MS, 'GitHub repos'),
        withTimeout(getUserActivity(user.githubUsername, token), API_TIMEOUT_MS, 'GitHub activity'),
      ]);
      syncData.github = { stats, repos, activity, lastSyncedAt: now };
    } catch (err) {
      console.error(`[Sync] GitHub failed for ${user.githubUsername}:`, err.message);
    }
  }

  if (user.codeforcesHandle) {
    try {
      const [userInfo, submissions, ratingHistory] = await Promise.all([
        withTimeout(getUserInfo(user.codeforcesHandle), API_TIMEOUT_MS, 'Codeforces userInfo'),
        withTimeout(getSubmissions(user.codeforcesHandle, 20), API_TIMEOUT_MS, 'Codeforces submissions'),
        withTimeout(getRatingHistory(user.codeforcesHandle), API_TIMEOUT_MS, 'Codeforces ratingHistory'),
      ]);
      syncData.codeforces = { userInfo, submissions, ratingHistory, lastSyncedAt: now };
    } catch (err) {
      console.error(`[Sync] Codeforces failed for ${user.codeforcesHandle}:`, err.message);
    }
  }

  if (user.leetcodeUsername) {
    try {
      const [stats, recentSubs] = await Promise.all([
        withTimeout(getLeetCodeStats(user.leetcodeUsername), API_TIMEOUT_MS, 'LeetCode stats'),
        withTimeout(getRecentSubmissions(user.leetcodeUsername).catch(() => []), API_TIMEOUT_MS, 'LeetCode recent submissions'),
      ]);
      syncData.leetcode = { stats, recentSubmissions: recentSubs, lastSyncedAt: now };
    } catch (err) {
      console.error(`[Sync] LeetCode failed for ${user.leetcodeUsername}:`, err.message);
    }
  }

  const wakatimeKey = user.getDecryptedWakatimeKey ? user.getDecryptedWakatimeKey() : null;
  const soId = user.stackoverflowId;
  const npmList = user.npmPackages || [];
  const pypiList = user.pypiPackages || [];

  const wakatimePromise = wakatimeKey
    ? withTimeout(getWakatimeStats(wakatimeKey), API_TIMEOUT_MS, 'WakaTime stats')
    : Promise.resolve(undefined);
  const soPromise = soId
    ? withTimeout(getStackOverflowStats(soId), API_TIMEOUT_MS, 'StackOverflow stats')
    : Promise.resolve(undefined);
  const packagesPromise = (npmList.length > 0 || pypiList.length > 0) 
    ? withTimeout(getPackageStats(npmList, pypiList), API_TIMEOUT_MS, 'Package stats')
    : Promise.resolve(undefined);

  const newPlatforms = await Promise.allSettled([wakatimePromise, soPromise, packagesPromise]);

  newPlatforms.forEach((r, i) => {
    if (r.status === 'rejected') {
      const platformName = ['WakaTime', 'StackOverflow', 'Packages'][i];
      console.error(`[Sync] ${platformName} failed:`, r.reason?.message || r.reason);
    }
  });

  const [wakatimeRes, soRes, pkgRes] = newPlatforms;

  if (wakatimeRes.status === 'fulfilled' && wakatimeRes.value !== undefined) {
    if (wakatimeRes.value !== null) {
      syncData.wakatime = { ...wakatimeRes.value, lastSyncedAt: now };
    }
  }

  if (soRes.status === 'fulfilled' && soRes.value !== undefined && soRes.value !== null) {
    syncData.stackoverflow = { ...soRes.value, lastSyncedAt: now };
  }

  if (pkgRes.status === 'fulfilled' && pkgRes.value !== undefined && pkgRes.value !== null) {
    syncData.packages = { ...pkgRes.value, lastSyncedAt: now };
  }

  const practiceReviewPromises = [];
  const practiceReviewLabels = [];

  if (user.codeforcesHandle) {
    practiceReviewPromises.push(withTimeout(getFailedProblems(user.codeforcesHandle), API_TIMEOUT_MS, 'Codeforces failed problems'));
    practiceReviewLabels.push('codeforces');
  }
  if (user.leetcodeUsername) {
    practiceReviewPromises.push(withTimeout(getRecentFailedSubmissions(user.leetcodeUsername), API_TIMEOUT_MS, 'LeetCode failed submissions'));
    practiceReviewLabels.push('leetcode');
  }

  if (practiceReviewPromises.length > 0) {
    const prResults = await Promise.allSettled(practiceReviewPromises);
    const failedPlatforms = [];
    const prData = { codeforces: [], leetcode: [], failedPlatforms: [], lastSyncedAt: now };

    prResults.forEach((r, i) => {
      const platform = practiceReviewLabels[i];
      if (r.status === 'fulfilled') {
        prData[platform] = r.value;
      } else {
        failedPlatforms.push(platform);
        console.error(`[Sync] Practice Review ${platform} failed:`, r.reason?.message || r.reason);
      }
    });

    prData.failedPlatforms = failedPlatforms;
    syncData.practiceReview = prData;
  }

  // --- Compute Skill Decay ---
  try {
    const lastTouched = new Map();

    if (syncData.github?.repos) {
      syncData.github.repos.forEach(r => {
        if (r.language && r.updatedAt) {
          const key = `lang:${r.language}`;
          const current = lastTouched.get(key) || 0;
          lastTouched.set(key, Math.max(current, new Date(r.updatedAt).getTime()));
        }
      });
    }

    if (syncData.leetcode?.recentSubmissions) {
      syncData.leetcode.recentSubmissions.forEach(sub => {
        if (sub.lang && sub.submittedAt) {
          // Normalize lang name slightly if needed, e.g. "python3" -> "Python"
          let l = sub.lang;
          if (l === 'python3' || l === 'python') l = 'Python';
          if (l === 'cpp') l = 'C++';
          if (l === 'java') l = 'Java';
          const key = `lang:${l}`;
          const current = lastTouched.get(key) || 0;
          lastTouched.set(key, Math.max(current, new Date(sub.submittedAt).getTime()));
        }
      });
    }

    if (syncData.codeforces?.submissions) {
      syncData.codeforces.submissions.forEach(sub => {
        if (sub.problem?.tags) {
          const time = sub.time * 1000;
          sub.problem.tags.forEach(tag => {
            const key = `tag:${tag}`;
            const current = lastTouched.get(key) || 0;
            lastTouched.set(key, Math.max(current, time));
          });
        }
      });
    }

    const decayItems = [];
    const nowTime = now.getTime();
    for (const [key, ts] of lastTouched.entries()) {
      const daysSince = Math.floor((nowTime - ts) / (1000 * 60 * 60 * 24));
      const isTag = key.startsWith('tag:');
      const name = key.split(':')[1];
      
      let rec = '';
      if (isTag) {
        rec = `https://codeforces.com/problemset?tags=${encodeURIComponent(name)}`;
      } else {
        rec = `https://github.com/search?q=is:open+is:issue+label:"good+first+issue"+language:${encodeURIComponent(name)}`;
      }
      
      decayItems.push({
        name,
        type: isTag ? 'tag' : 'language',
        daysSince,
        recommendation: rec,
      });
    }

    // Sort by daysSince descending (most rusty first)
    decayItems.sort((a, b) => b.daysSince - a.daysSince);

    syncData.skillDecay = {
      items: decayItems,
      lastComputedAt: now,
    };
  } catch (err) {
    console.error(`[Sync] Skill Decay computation failed:`, err.message);
  }

  syncData.lastFullSync = now;
  await syncData.save();

  // Save daily snapshot
  await saveDailySnapshot(userId, syncData);

  console.log(`[Sync] Completed for user ${user.name} (${userId})`);
  return syncData;
}

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

/**
 * Run a bounded background sync across eligible users.
 * Supports skipping recently-synced users, limiting batch sizes,
 * and rate-limit throttling to prevent serverless execution timeouts.
 */
async function syncAllUsers({
  limit = 10,
  skipSyncedWithinMinutes = 120,
  batchSize = 3,
  batchDelayMs = 1000,
} = {}) {
  const users = await User.find({
    $or: [
      { githubUsername: { $exists: true, $ne: '' } },
      { codeforcesHandle: { $exists: true, $ne: '' } },
      { leetcodeUsername: { $exists: true, $ne: '' } },
      { stackoverflowId: { $exists: true, $ne: '' } },
      { wakatimeApiKey: { $exists: true, $ne: null } },
    ],
  }).select('_id name');

  let usersToSync = users;

  if (skipSyncedWithinMinutes > 0) {
    const cutoff = new Date(Date.now() - skipSyncedWithinMinutes * 60 * 1000);
    const recentSyncs = await SyncData.find({
      lastFullSync: { $gte: cutoff },
    }).select('userId');
    const recentSet = new Set(recentSyncs.map((s) => s.userId.toString()));
    usersToSync = users.filter((u) => !recentSet.has(u._id.toString()));
  }

  const selectedUsers = usersToSync.slice(0, limit);
  let successCount = 0;
  let failureCount = 0;
  const errors = [];

  for (let i = 0; i < selectedUsers.length; i += batchSize) {
    const batch = selectedUsers.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((user) => syncUserData(user._id))
    );

    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        successCount++;
      } else {
        failureCount++;
        errors.push({
          userId: batch[idx]._id,
          name: batch[idx].name,
          error: res.reason?.message || 'Unknown sync error',
        });
      }
    });

    if (i + batchSize < selectedUsers.length && batchDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, batchDelayMs));
    }
  }

  return {
    totalEligible: users.length,
    skippedRecent: users.length - usersToSync.length,
    processed: selectedUsers.length,
    successful: successCount,
    failed: failureCount,
    errors,
  };
}

module.exports = { syncUserData, syncAllUsers, withTimeout };