const cron = require('node-cron');
const User = require('../models/User');
const { syncUserData } = require('../services/sync.service');

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Start the background sync cron job.
 * Runs every 3 hours. Processes users in batches of 5 with a 2-second delay
 * between batches to avoid external API rate limit spikes.
 */
function startSyncCron() {
  // Every 3 hours: '0 */3 * * *'
  cron.schedule('0 */3 * * *', async () => {
    console.log('[Cron] Starting background sync...');

    try {
      // Find all users who have at least one connected account
      const users = await User.find({
        $or: [
          { githubUsername: { $ne: '' } },
          { codeforcesHandle: { $ne: '' } },
          { leetcodeUsername: { $ne: '' } },
        ],
      }).select('_id');

      console.log(`[Cron] Found ${users.length} users to sync`);

      // Process in batches
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE);
        
        await Promise.allSettled(
          batch.map((user) => syncUserData(user._id))
        );

        // Delay between batches (unless it's the last batch)
        if (i + BATCH_SIZE < users.length) {
          await sleep(BATCH_DELAY_MS);
        }
      }

      console.log('[Cron] Background sync complete');
    } catch (error) {
      console.error('[Cron] Sync error:', error.message);
    }
  });

  console.log('[Cron] Sync job scheduled — runs every 3 hours');
}

module.exports = { startSyncCron };
