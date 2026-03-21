const mongoose = require('mongoose');

const dailySnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    github: {
      repos: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
    },
    codeforces: {
      rating: { type: Number, default: 0 },
      maxRating: { type: Number, default: 0 },
      rank: { type: String, default: 'Unrated' },
    },
    leetcode: {
      totalSolved: { type: Number, default: 0 },
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
      ranking: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL: Compound unique index — one snapshot per user per day.
// Without this, `unique: true` on `date` alone would allow only ONE snapshot
// globally per day across ALL users.
dailySnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailySnapshot', dailySnapshotSchema);
