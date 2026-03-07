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

module.exports = { getUserInfo, getSubmissions, getRatingHistory };
