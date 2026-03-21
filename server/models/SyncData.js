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
    wakatime: {
      totalSeconds: { type: Number, default: null },
      dailyAverage: { type: Number, default: null },
      languages: {
        type: [{
          name: String,
          percent: Number,
          total_seconds: Number,
        }],
        default: []
      },
      lastSyncedAt: { type: Date, default: null },
    },
    stackoverflow: {
      reputation: { type: Number, default: null },
      badges: {
        gold: { type: Number, default: 0 },
        silver: { type: Number, default: 0 },
        bronze: { type: Number, default: 0 }
      },
      topAnswers: {
        type: [{
          title: String,
          score: Number,
          link: String,
        }],
        default: []
      },
      lastSyncedAt: { type: Date, default: null },
    },
    packages: {
      npm: {
        type: [{
          name: String,
          weeklyDownloads: Number,
        }],
        default: []
      },
      pypi: {
        type: [{
          name: String,
          weeklyDownloads: Number,
        }],
        default: []
      },
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
