const DailySnapshot = require('../models/DailySnapshot');
const SyncData = require('../models/SyncData');

/**
 * Determine if a given date (YYYY-MM-DD) had any developer activity.
 * Activity = GitHub commit, CF/LC submission, or WakaTime coding session.
 */
function dateStr(date) {
  return date.toISOString().split('T')[0];
}

async function getStreakData(userId) {
  // Get all snapshots sorted descending
  const snapshots = await DailySnapshot.find({ userId }).sort({ date: -1 }).lean();
  const syncData = await SyncData.findOne({ userId }).lean();

  // Build a set of active dates from snapshots
  // A day is "active" if LC solved count increased OR CF rating changed OR github repos changed
  const activeDates = new Set();

  // Walk snapshots in ascending order to detect day-over-day changes
  const asc = [...snapshots].reverse();
  for (let i = 1; i < asc.length; i++) {
    const prev = asc[i - 1];
    const curr = asc[i];
    const changed =
      curr.leetcode?.totalSolved > prev.leetcode?.totalSolved ||
      curr.codeforces?.rating !== prev.codeforces?.rating ||
      curr.github?.repos > prev.github?.repos ||
      curr.github?.stars > prev.github?.stars;
    if (changed) activeDates.add(curr.date);
  }

  // Also add days with GitHub push activity from syncData
  if (syncData?.github?.activity) {
    for (const event of syncData.github.activity) {
      if (event.type === 'PushEvent' && event.createdAt) {
        activeDates.add(dateStr(new Date(event.createdAt)));
      }
    }
  }

  // Also add days with CF submissions
  if (syncData?.codeforces?.submissions) {
    for (const sub of syncData.codeforces.submissions) {
      if (sub.time) {
        activeDates.add(dateStr(new Date(sub.time * 1000)));
      }
    }
  }

  // Calculate current streak (consecutive days ending today or yesterday)
  const today = dateStr(new Date());
  const yesterday = dateStr(new Date(Date.now() - 86400000));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  // Sort all active dates descending
  const sortedDates = Array.from(activeDates).sort((a, b) => b.localeCompare(a));

  // Current streak: walk back from today
  const startDate = activeDates.has(today) ? today : activeDates.has(yesterday) ? yesterday : null;
  if (startDate) {
    let cursor = new Date(startDate);
    while (activeDates.has(dateStr(cursor))) {
      currentStreak++;
      cursor = new Date(cursor.getTime() - 86400000);
    }
  }

  // Longest streak: walk all dates ascending
  const ascDates = Array.from(activeDates).sort();
  for (const d of ascDates) {
    const curr = new Date(d);
    if (prevDate) {
      const diff = (curr - prevDate) / 86400000;
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    prevDate = curr;
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Build last 52 days activity map for mini calendar
  const last52 = [];
  for (let i = 51; i >= 0; i--) {
    const d = dateStr(new Date(Date.now() - i * 86400000));
    last52.push({ date: d, active: activeDates.has(d) });
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: activeDates.size,
    activeToday: activeDates.has(today),
    last52,
  };
}

module.exports = { getStreakData };
