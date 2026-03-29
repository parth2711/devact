const { getUpcomingContests } = require('../services/contests.service');

// Simple in-memory cache so we don't hammer CF/LC on every page load
let cache = { data: null, fetchedAt: null };
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// @desc    Get upcoming contests from CF + LC
// @route   GET /api/contests
// @access  Private
const getContests = async (req, res) => {
  try {
    const now = Date.now();
    if (cache.data && cache.fetchedAt && now - cache.fetchedAt < CACHE_TTL_MS) {
      return res.json(cache.data);
    }

    const contests = await getUpcomingContests();
    cache = { data: contests, fetchedAt: now };
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getContests };
