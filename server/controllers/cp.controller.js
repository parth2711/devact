const SyncData = require('../models/SyncData');
const { getUserInfo, getSubmissions, getRatingHistory } = require('../services/codeforces.service');
const { getLeetCodeStats, getRecentSubmissions } = require('../services/leetcode.service');
const crypto = require('crypto');
const User = require('../models/User');

// @desc    Get Codeforces user stats (from cache)
// @route   GET /api/cp/stats
// @access  Private
const getCPStats = async (req, res) => {
  try {
    const handle = req.user.codeforcesHandle;
    if (!handle) {
      return res.status(400).json({ message: 'Codeforces handle not set. Update your profile first.' });
    }

    const syncData = await SyncData.findOne({ userId: req.user._id });
    if (syncData?.codeforces?.userInfo && syncData?.codeforces?.ratingHistory) {
      return res.json({
        userInfo: syncData.codeforces.userInfo,
        ratingHistory: syncData.codeforces.ratingHistory,
      });
    }

    // Fallback to live
    const [userInfo, ratingHistory] = await Promise.all([
      getUserInfo(handle),
      getRatingHistory(handle),
    ]);
    res.json({ userInfo, ratingHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent Codeforces submissions (from cache)
// @route   GET /api/cp/submissions
// @access  Private
const getCPSubmissions = async (req, res) => {
  try {
    const handle = req.user.codeforcesHandle;
    if (!handle) {
      return res.status(400).json({ message: 'Codeforces handle not set. Update your profile first.' });
    }

    const syncData = await SyncData.findOne({ userId: req.user._id });
    if (syncData?.codeforces?.submissions) {
      return res.json(syncData.codeforces.submissions);
    }

    const submissions = await getSubmissions(handle, 20);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get LeetCode stats (from cache)
// @route   GET /api/cp/leetcode
// @access  Private
const getLeetCode = async (req, res) => {
  try {
    const username = req.user.leetcodeUsername;
    if (!username) {
      return res.status(400).json({ message: 'LeetCode username not set. Update your profile first.' });
    }

    const syncData = await SyncData.findOne({ userId: req.user._id });
    if (syncData?.leetcode?.stats) {
      return res.json(syncData.leetcode.stats);
    }

    const stats = await getLeetCodeStats(username);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get practice review (failed problems, cached)
// @route   GET /api/cp/practice-review
// @access  Private
const getPracticeReview = async (req, res) => {
  try {
    const syncData = await SyncData.findOne({ userId: req.user._id });
    if (!syncData?.practiceReview) {
      return res.json({ codeforces: [], leetcode: [], failedPlatforms: [], lastSyncedAt: null });
    }
    res.json(syncData.practiceReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -- Verification endpoints remain unchanged --

const initCodeforcesVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const token = 'devact-verify-' + crypto.randomBytes(8).toString('hex');
    user.codeforcesVerificationToken = token;
    await user.save();
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkCodeforcesVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const handle = user.codeforcesHandle;
    const token = user.codeforcesVerificationToken;
    if (!handle || !token) {
      return res.status(400).json({ message: 'Handle or verification token not set' });
    }
    const userInfo = await getUserInfo(handle);
    if ((userInfo.firstName === token) || (userInfo.lastName === token)) {
      user.isCodeforcesVerified = true;
      user.codeforcesVerificationToken = undefined;
      await user.save();
      return res.json({ message: 'Codeforces account verified successfully', verified: true });
    } else {
      return res.status(400).json({
        message: 'Verification failed. Please ensure you have set your Codeforces First Name or Last Name to the token exactly.',
        verified: false,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeetCodeSubmissions = async (req, res) => {
  try {
    const username = req.user.leetcodeUsername;
    if (!username) {
      return res.status(400).json({ message: 'LeetCode username not set.' });
    }
    const submissions = await getRecentSubmissions(username);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCPStats, getCPSubmissions, getLeetCode, getLeetCodeSubmissions, getPracticeReview, initCodeforcesVerification, checkCodeforcesVerification };