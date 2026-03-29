const UserGoals = require('../models/UserGoals');
const SyncData  = require('../models/SyncData');
const DailySnapshot = require('../models/DailySnapshot');

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr() {
  return new Date(Date.now() - 86400000).toISOString().split('T')[0];
}

// @desc    Get user goals + today's progress
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const [goalsDoc, syncData] = await Promise.all([
      UserGoals.findOne({ userId: req.user._id }),
      SyncData.findOne({ userId: req.user._id }),
    ]);

    const goals = goalsDoc?.goals || [];

    // Get yesterday's snapshot to measure today's delta
    const today = todayStr();
    const yesterday = yesterdayStr();
    const [todaySnap, yestSnap] = await Promise.all([
      DailySnapshot.findOne({ userId: req.user._id, date: today }).lean(),
      DailySnapshot.findOne({ userId: req.user._id, date: yesterday }).lean(),
    ]);

    // Calculate today's progress per goal type
    const progress = {};

    // LC problems solved today = today's total - yesterday's total
    const lcToday = (todaySnap?.leetcode?.totalSolved || 0) - (yestSnap?.leetcode?.totalSolved || 0);
    progress.lc_solved = Math.max(0, lcToday);

    // CF submissions today
    const cfSubs = syncData?.codeforces?.submissions || [];
    const todayStart = new Date(today).getTime() / 1000;
    progress.cf_submitted = cfSubs.filter((s) => s.time >= todayStart).length;

    // WakaTime hours today (totalSeconds / 3600, assuming it's today's data)
    progress.waka_hours = Math.floor((syncData?.wakatime?.totalSeconds || 0) / 3600);

    // GitHub commits today
    const ghActivity = syncData?.github?.activity || [];
    progress.github_commits = ghActivity.filter((e) => {
      if (e.type !== 'PushEvent' || !e.createdAt) return false;
      return e.createdAt.startsWith(today);
    }).reduce((sum, e) => sum + (e.payload?.commits || 1), 0);

    // Attach progress to each goal
    const goalsWithProgress = goals
      .filter((g) => g.enabled)
      .map((g) => ({
        id: g.id,
        label: g.label,
        type: g.type,
        target: g.target,
        current: g.type === 'custom' ? 0 : (progress[g.type] ?? 0),
        done: g.type === 'custom' ? false : (progress[g.type] ?? 0) >= g.target,
      }));

    res.json({ goals: goalsWithProgress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save (upsert) user goals
// @route   PUT /api/goals
// @access  Private
const saveGoals = async (req, res) => {
  try {
    const { goals } = req.body;
    if (!Array.isArray(goals)) {
      return res.status(400).json({ message: 'goals must be an array' });
    }

    const doc = await UserGoals.findOneAndUpdate(
      { userId: req.user._id },
      { goals },
      { upsert: true, new: true }
    );

    res.json({ goals: doc.goals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a custom goal as done for today
// @route   PATCH /api/goals/:id/toggle
// @access  Private
const toggleGoal = async (req, res) => {
  try {
    const doc = await UserGoals.findOne({ userId: req.user._id });
    if (!doc) return res.status(404).json({ message: 'No goals found' });

    const goal = doc.goals.find((g) => g.id === req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    // For custom goals only — toggle enabled
    goal.enabled = !goal.enabled;
    await doc.save();
    res.json({ goal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGoals, saveGoals, toggleGoal };
