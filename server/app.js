const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
const { generalLimiter } = require('./middleware/rateLimiter');
const cronSyncHandler = require('../api/cron/sync');

// ── Import route handlers ──
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

/**
 * Validate that all required environment variables are set.
 * Throws a descriptive error instead of calling process.exit,
 * so the caller (entry point) can decide how to handle it.
 */
function validateEnv() {
  const missing = [];

  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.SESSION_SECRET) missing.push('SESSION_SECRET');
  if (!process.env.FRONTEND_URL) missing.push('FRONTEND_URL');

  if (!process.env.ENCRYPTION_KEY || Buffer.from(process.env.ENCRYPTION_KEY).length !== 32) {
    missing.push('ENCRYPTION_KEY (must be exactly 32 bytes)');
  }

  if (missing.length > 0) {
    throw new Error(`[Config] Missing or invalid environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Create and configure the shared Express application.
 * @param {Object} options
 * @param {Function} [options.dbMiddleware] - Optional per-request DB connection middleware.
 *   Used in serverless (Vercel) to lazily connect before route handlers execute.
 *   In local dev, the DB is connected eagerly before the server starts listening.
 * @param {boolean} [options.validate=true] - Whether to validate environment variables.
 */
function createApp({ dbMiddleware, validate = true } = {}) {
  if (validate) {
    validateEnv();
  }

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const app = express();

  // ── Security ──
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // ── CORS ──
  app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
  }));

  // ── Body parsing ──
  app.use(express.json());
  app.use(cookieParser());

  // ── Rate limiting ──
  app.use('/api', generalLimiter);

  // ── Per-request DB connection (if provided) ──
  if (dbMiddleware) {
    app.use(dbMiddleware);
  }

  // ── Sessions (for Passport OAuth) ──
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // ── Mount cron sync endpoint ──
  app.all('/api/cron/sync', cronSyncHandler);

  // ── Routes ──
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

  // ── Health check ──
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── Error handler ──
  app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(err.status || 500).json({
      message: process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message,
    });
  });

  return app;
}

module.exports = { createApp, validateEnv };
