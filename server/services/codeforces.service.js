const CF_API = 'https://codeforces.com/api';

/**
 * Get Codeforces user info (rating, rank, etc.)
 */
async function getUserInfo(handle) {
  const res = await fetch(`${CF_API}/user.info?handles=${handle}`);
  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Failed to fetch Codeforces user info');
  }

  const user = data.result[0];
  return {
    handle: user.handle,
    rating: user.rating || 0,
    maxRating: user.maxRating || 0,
    rank: user.rank || 'Unrated',
    maxRank: user.maxRank || 'Unrated',
    contribution: user.contribution || 0,
    avatar: user.titlePhoto,
    friendOfCount: user.friendOfCount || 0,
    registrationTime: user.registrationTimeSeconds,
  };
}

/**
 * Get recent submissions for a Codeforces user.
 */
async function getSubmissions(handle, count = 20) {
  const res = await fetch(`${CF_API}/user.status?handle=${handle}&from=1&count=${count}`);
  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Failed to fetch submissions');
  }

  return data.result.map((sub) => ({
    id: sub.id,
    problem: {
      name: sub.problem.name,
      index: sub.problem.index,
      rating: sub.problem.rating || null,
      tags: sub.problem.tags || [],
    },
    verdict: sub.verdict || 'TESTING',
    language: sub.programmingLanguage,
    time: sub.creationTimeSeconds,
    contestId: sub.contestId,
  }));
}

/**
 * Get rating history for a Codeforces user.
 */
async function getRatingHistory(handle) {
  const res = await fetch(`${CF_API}/user.rating?handle=${handle}`);
  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Failed to fetch rating history');
  }

  return data.result.map((contest) => ({
    contestId: contest.contestId,
    contestName: contest.contestName,
    rank: contest.rank,
    oldRating: contest.oldRating,
    newRating: contest.newRating,
    ratingChange: contest.newRating - contest.oldRating,
    time: contest.ratingUpdateTimeSeconds,
  }));
}

/**
 * Get failed/unsolved problems from recent submissions.
 * Deduplicates keeping only the most recent submission per unique problem.
 */
async function getFailedProblems(handle) {
  const res = await fetch(`${CF_API}/user.status?handle=${handle}&from=1&count=100`);
  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Failed to fetch submissions');
  }

  const failed = data.result.filter(sub => sub.verdict && sub.verdict !== 'OK');

  // Deduplicate: keep only most recent per contestId+index
  const seen = new Map();
  for (const sub of failed) {
    const key = `${sub.contestId}-${sub.problem.index}`;
    if (!seen.has(key)) {
      seen.set(key, {
        name: sub.problem.name,
        index: sub.problem.index,
        contestId: sub.contestId,
        rating: sub.problem.rating || null,
        verdict: sub.verdict,
        link: `https://codeforces.com/contest/${sub.contestId}/problem/${sub.problem.index}`,
        submittedAt: new Date(sub.creationTimeSeconds * 1000),
      });
    }
  }

  return Array.from(seen.values());
}

module.exports = { getUserInfo, getSubmissions, getRatingHistory, getFailedProblems };
