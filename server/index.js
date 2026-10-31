const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const connectDB = require('./config/db');
const { createApp, validateEnv } = require('./app');
const { startSyncCron } = require('./cron/sync.cron');

try {
  validateEnv();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const app = createApp();

connectDB().catch((err) => {
  console.error('[DB] Eager connection error:', err.message);
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    startSyncCron();
  });
}

module.exports = app;