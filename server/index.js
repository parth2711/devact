const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { generalLimiter } = require('./middleware/rateLimiter');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

if (!process.env.ENCRYPTION_KEY || Buffer.from(process.env.ENCRYPTION_KEY).length !== 32) {
  console.error('[Config] ENCRYPTION_KEY must be exactly 32 bytes. Current length:', 
    process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY).length : 0
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('[Config] JWT_SECRET is not set');
  process.exit(1);
}

if (!process.env.FRONTEND_URL) {
  console.error('[Config] FRONTEND_URL is not set');
  process.exit(1);
}

const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth.routes');
const githubRoutes = require('./routes/github.routes');
const cpRoutes = require('./routes/cp.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const repoRoutes = require('./routes/repo.routes');
const syncRoutes = require('./routes/sync.routes');
const snapshotRoutes = require('./routes/snapshot.routes');
const publicRoutes = require('./routes/public.routes');
const accountRoutes = require('./routes/account.routes');
const contestsRoutes = require('./routes/contests.routes');
const streakRoutes = require('./routes/streak.routes');
const goalsRoutes = require('./routes/goals.routes');
const journalRoutes = require('./routes/journal.routes');
const { startSyncCron } = require('./cron/sync.cron');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/cp', cpRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/snapshots', snapshotRoutes);
app.use('/api/u', publicRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/journal', journalRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message,
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    startSyncCron();
  });
}

module.exports = app;