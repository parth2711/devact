const connectDB = require('../../server/config/db');
const { syncAllUsers } = require('../../server/services/sync.service');

/**
 * Vercel Serverless Function / HTTP endpoint for scheduled background sync.
 * Secured via Bearer token matching CRON_SECRET.
 */
async function cronSyncHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Cron] CRON_SECRET is not configured');
    return res.status(500).json({ message: 'CRON_SECRET is not configured' });
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB();

    const limit = parseInt(req.query?.limit, 10) || 10;
    const skipSyncedWithin = parseInt(req.query?.skipSyncedWithin, 10) || 120;

    const result = await syncAllUsers({
      limit,
      skipSyncedWithinMinutes: skipSyncedWithin,
    });

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error('[Cron] Background sync error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
}

module.exports = cronSyncHandler;
