const cron = require('node-cron');
const { syncAllUsers } = require('../services/sync.service');

/**
 * Start the background sync cron job.
 * Runs every 3 hours for local development environments.
 * Uses bounded sync with rate limiting and deduplication.
 */
function startSyncCron() {
  // Every 3 hours: '0 */3 * * *'
  cron.schedule('0 */3 * * *', async () => {
    console.log('[Cron] Starting background sync...');

    try {
      const summary = await syncAllUsers({
        limit: 50,
        skipSyncedWithinMinutes: 150,
        batchSize: 5,
        batchDelayMs: 2000,
      });

      console.log(
        `[Cron] Background sync complete. Processed: ${summary.processed}, Successful: ${summary.successful}, Failed: ${summary.failed}, Skipped recent: ${summary.skippedRecent}`
      );
    } catch (error) {
      console.error('[Cron] Sync error:', error.message);
    }
  });

  console.log('[Cron] Sync job scheduled — runs every 3 hours');
}

module.exports = { startSyncCron };

