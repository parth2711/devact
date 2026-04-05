const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    goals: [
      {
        id:    { type: String, required: true },
        label: { type: String, required: true },
        type: {
          type: String,
          enum: ['lc_solved', 'cf_submitted', 'waka_hours', 'github_commits', 'custom'],
          default: 'custom',
        },
        target:  { type: Number,  default: 1    },
        enabled: { type: Boolean, default: true },
      },
    ],
    // Persisted done state for custom goals per day — pruned after 7 days
    customDone: [
      {
        goalId: { type: String, required: true },
        date:   { type: String, required: true }, // YYYY-MM-DD
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserGoals', goalSchema);
