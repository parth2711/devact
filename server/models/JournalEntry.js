const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,   // YYYY-MM-DD
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'bad', ''],
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// One entry per user per day
journalEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
