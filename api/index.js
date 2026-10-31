const connectDB = require('../server/config/db');
const { createApp } = require('../server/app');

// ── Per-request DB connection (serverless-safe) ──
const dbMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Database connection failed' });
  }
};

// ── Express App (shared configuration) ──
const app = createApp({ dbMiddleware });

module.exports = app;
