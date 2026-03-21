const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars — try local .env first, Vercel provides env vars automatically
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth.routes');
const githubRoutes = require('./routes/github.routes');
const cpRoutes = require('./routes/cp.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const repoRoutes = require('./routes/repo.routes');
const syncRoutes = require('./routes/sync.routes');
const snapshotRoutes = require('./routes/snapshot.routes');
const publicRoutes = require('./routes/public.routes');
const { startSyncCron } = require('./cron/sync.cron');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (cached for serverless)
connectDB();

// Initialize Session and Passport
app.use(
  session({
    secret: process.env.JWT_SECRET || 'devact_session_secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/cp', cpRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/snapshots', snapshotRoutes);
app.use('/api/u', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    // Start background sync cron (only on persistent hosting, not Vercel)
    startSyncCron();
  });
}

module.exports = app;
