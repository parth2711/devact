const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Startup Config Check for WakaTime encryption
if (!process.env.ENCRYPTION_KEY || Buffer.from(process.env.ENCRYPTION_KEY).length !== 32) {
  console.error('[Config] ENCRYPTION_KEY must be exactly 32 bytes for AES-256-CBC');
  process.exit(1);
}

const connectDB = require('../server/config/db');

// ── Import route handlers ──
const authRoutes = require('../server/routes/auth.routes');
const githubRoutes = require('../server/routes/github.routes');
const cpRoutes = require('../server/routes/cp.routes');
const dashboardRoutes = require('../server/routes/dashboard.routes');
const repoRoutes = require('../server/routes/repo.routes');
const syncRoutes = require('../server/routes/sync.routes');
const snapshotRoutes = require('../server/routes/snapshot.routes');
const publicRoutes = require('../server/routes/public.routes');

const session = require('express-session');
const passport = require('../server/config/passport');

// ── Express App ──
const app = express();
app.use(cors());
app.use(express.json());

// Connect on every request (cached — only connects once)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: `Database connection failed: ${err.message}` });
  }
});

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

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
