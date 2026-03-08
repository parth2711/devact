const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars (only required locally, Vercel injects them)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

// ── MongoDB Connection (cached for serverless) ──
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Prevent 10000ms buffering timeouts
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
  return cached.conn;
};

// ── Import route handlers ──
const authRoutes = require('../server/routes/auth.routes');
const githubRoutes = require('../server/routes/github.routes');
const cpRoutes = require('../server/routes/cp.routes');
const dashboardRoutes = require('../server/routes/dashboard.routes');
const repoRoutes = require('../server/routes/repo.routes');

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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/cp', cpRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/repos', repoRoutes);

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
