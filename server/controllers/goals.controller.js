const UserGoals     = require('../models/UserGoals');
const SyncData      = require('../models/SyncData');
const DailySnapshot = require('../models/DailySnapshot');

const todayStr     = () => new Date().toISOString().split('T')[0];
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().split('T')[0];

// @desc    Get user goals + today's progress
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const today     = todayStr();
    const yesterday = yesterdayStr();

    const [goalsDoc, syncData, todaySnap, yestSnap] = await Promise.all([
      UserGoals.findOne({ userId: req.user._id }),
      SyncData.findOne({ userId: req.user._id }),
      DailySnapshot.findOne({ userId: req.user._id, date: today }).lean(),
      DailySnapshot.findOne({ userId: req.user._id, date: yesterday }).lean(),
    ]);

    const goals      = goalsDoc?.goals      || [];
    const customDone = goalsDoc?.customDone || [];

    // Which custom goal IDs are marked done today
    const doneTodaySet = new Set(
      customDone.filter(d => d.date === today).map(d => d.goalId)
    );

    // Auto-progress for tracked types
    const lcDelta   = Math.max(0, (todaySnap?.leetcode?.totalSolved || 0) - (yestSnap?.leetcode?.totalSolved || 0));
    const cfToday   = (syncData?.codeforces?.submissions || [])
                        .filter(s => s.time >= new Date(today).getTime() / 1000).length;
    const wakaHours = Math.floor((syncData?.wakatime?.totalSeconds || 0) / 3600);
    const ghCommits = (syncData?.github?.activity || [])
                        .filter(e => e.type === 'PushEvent' && e.createdAt?.startsWith(today))
                        .reduce((sum, e) => sum + (e.payload?.commits || 1), 0);

    const progress = { lc_solved: lcDelta, cf_submitted: cfToday, waka_hours: wakaHours, github_commits: ghCommits };

    const goalsWithProgress = goals
      .filter(g => g.enabled)
      .map(g => {
        const current = g.type === 'custom' ? 0 : (progress[g.type] ?? 0);
        const done    = g.type === 'custom' ? doneTodaySet.has(g.id) : current >= g.target;
        return { id: g.id, label: g.label, type: g.type, target: g.target, current, done };
      });

    res.json({ goals: goalsWithProgress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save (upsert) goal definitions
// @route   PUT /api/goals
// @access  Private
const saveGoals = async (req, res) => {
  try {
    const { goals } = req.body;
    if (!Array.isArray(goals)) return res.status(400).json({ message: 'goals must be an array' });

    const doc = await UserGoals.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { goals } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ goals: doc.goals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle a custom goal done/undone for today (persisted in DB)
// @route   PATCH /api/goals/:id/toggle
// @access  Private
const toggleGoal = async (req, res) => {
  try {
    const today  = todayStr();
    const goalId = req.params.id;

    const doc = await UserGoals.findOne({ userId: req.user._id });
    if (!doc) return res.status(404).json({ message: 'No goals found' });

    const goal = doc.goals.find(g => g.id === goalId);
    if (!goal)              return res.status(404).json({ message: 'Goal not found' });
    if (goal.type !== 'custom') return res.status(400).json({ message: 'Only custom goals can be toggled manually' });

    const alreadyDone = doc.customDone.some(d => d.goalId === goalId && d.date === today);

    if (alreadyDone) {
      doc.customDone = doc.customDone.filter(d => !(d.goalId === goalId && d.date === today));
    } else {
      doc.customDone.push({ goalId, date: today });
    }

    // Prune entries older than 7 days
    const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    doc.customDone = doc.customDone.filter(d => d.date >= cutoff);

    await doc.save();
    res.json({ done: !alreadyDone });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGoals, saveGoals, toggleGoal };
