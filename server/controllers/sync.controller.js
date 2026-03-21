const SyncData = require('../models/SyncData');
const { syncUserData } = require('../services/sync.service');

const SYNC_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

// @desc    Trigger manual sync for logged-in user
// @route   POST /api/sync/now
// @access  Private
const triggerSync = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check rate limit via lastFullSync
    const existing = await SyncData.findOne({ userId });
    if (existing && existing.lastFullSync) {
      const elapsed = Date.now() - new Date(existing.lastFullSync).getTime();
      if (elapsed < SYNC_COOLDOWN_MS) {
        const minutesLeft = Math.ceil((SYNC_COOLDOWN_MS - elapsed) / 60000);
        return res.status(429).json({
          message: `Sync is rate limited. Try again in ${minutesLeft} minute(s).`,
          lastSyncedAt: existing.lastFullSync,
        });
      }
    }

    // Run sync asynchronously — respond immediately, sync in background
    res.json({ message: 'Sync started', syncing: true });

    try {
      await syncUserData(userId);
    } catch (err) {
      console.error(`[Sync] Manual sync failed for ${userId}:`, err.message);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sync status for logged-in user
// @route   GET /api/sync/status
// @access  Private
const getSyncStatus = async (req, res) => {
  try {
    const syncData = await SyncData.findOne({ userId: req.user._id });

    if (!syncData) {
      return res.json({
        synced: false,
        lastFullSync: null,
        github: null,
        codeforces: null,
        leetcode: null,
      });
    }

    res.json({
      synced: true,
      lastFullSync: syncData.lastFullSync,
      github: syncData.github?.lastSyncedAt || null,
      codeforces: syncData.codeforces?.lastSyncedAt || null,
      leetcode: syncData.leetcode?.lastSyncedAt || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { triggerSync, getSyncStatus };
