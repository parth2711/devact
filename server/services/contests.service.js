/**
 * Fetches upcoming contests from Codeforces and LeetCode.
 */

async function getCodeforcesContests() {
  try {
    const res = await fetch('https://codeforces.com/api/contest.list?gym=false');
    const data = await res.json();
    if (data.status !== 'OK') return [];

    const now = Math.floor(Date.now() / 1000);

    return data.result
      .filter((c) => c.phase === 'BEFORE')
      .map((c) => ({
        platform: 'codeforces',
        id: String(c.id),
        name: c.name,
        startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
        durationSeconds: c.durationSeconds,
        url: `https://codeforces.com/contests/${c.id}`,
        registerUrl: `https://codeforces.com/contestRegistration/${c.id}`,
      }))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 10);
  } catch {
    return [];
  }
}

async function getLeetCodeContests() {
  try {
    const query = `
      query {
        allContests {
          title
          titleSlug
          startTime
          duration
          isVirtual
        }
      }
    `;

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'DevAct' },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    const now = Math.floor(Date.now() / 1000);

    return (data.data?.allContests || [])
      .filter((c) => !c.isVirtual && c.startTime > now)
      .map((c) => ({
        platform: 'leetcode',
        id: c.titleSlug,
        name: c.title,
        startTime: new Date(c.startTime * 1000).toISOString(),
        durationSeconds: c.duration,
        url: `https://leetcode.com/contest/${c.titleSlug}/`,
        registerUrl: `https://leetcode.com/contest/${c.titleSlug}/`,
      }))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5);
  } catch {
    return [];
  }
}

async function getUpcomingContests() {
  const [cf, lc] = await Promise.all([getCodeforcesContests(), getLeetCodeContests()]);

  // Merge and sort by start time
  return [...cf, ...lc].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

module.exports = { getUpcomingContests };
