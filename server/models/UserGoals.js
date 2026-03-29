const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,  // one goals doc per user
    },
    goals: [
      {
        id: { type: String, required: true },          // client-generated uuid
        label: { type: String, required: true },        // "Solve 2 LC problems"
        type: {
          type: String,
          enum: ['lc_solved', 'cf_submitted', 'waka_hours', 'github_commits', 'custom'],
          default: 'custom',
        },
        target: { type: Number, default: 1 },           // numeric target (e.g. 2 problems)
        enabled: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserGoals', goalSchema);
