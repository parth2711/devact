const mongoose = require('mongoose');

const syncDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    github: {
      stats: { type: mongoose.Schema.Types.Mixed, default: null },
      repos: { type: mongoose.Schema.Types.Mixed, default: null },
      activity: { type: mongoose.Schema.Types.Mixed, default: null },
      lastSyncedAt: { type: Date, default: null },
    },
    codeforces: {
      userInfo: { type: mongoose.Schema.Types.Mixed, default: null },
      submissions: { type: mongoose.Schema.Types.Mixed, default: null },
      ratingHistory: { type: mongoose.Schema.Types.Mixed, default: null },
      lastSyncedAt: { type: Date, default: null },
    },
    leetcode: {
      stats: { type: mongoose.Schema.Types.Mixed, default: null },
      lastSyncedAt: { type: Date, default: null },
    },
    lastFullSync: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SyncData', syncDataSchema);
