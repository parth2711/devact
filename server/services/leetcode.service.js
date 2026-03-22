const LC_API = 'https://leetcode.com/graphql';

/**
 * Fetch LeetCode user profile and solved problem stats via public GraphQL API.
 */
async function getLeetCodeStats(username) {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
          starRating
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const res = await fetch(LC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DevAct',
    },
    body: JSON.stringify({
      query,
      variables: { username },
    }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode API error: ${res.status}`);
  }

  const data = await res.json();

  if (!data.data?.matchedUser) {
    throw new Error(`LeetCode user "${username}" not found`);
  }

  const user = data.data.matchedUser;
  const stats = {};

  (user.submitStatsGlobal?.acSubmissionNum || []).forEach((item) => {
    stats[item.difficulty.toLowerCase()] = item.count;
  });

  return {
    username: user.username,
    ranking: user.profile?.ranking || 0,
    reputation: user.profile?.reputation || 0,
    solved: {
      all: stats.all || 0,
      easy: stats.easy || 0,
      medium: stats.medium || 0,
      hard: stats.hard || 0,
    },
  };
}

/**
 * Fetch recent failed LeetCode submissions.
 * Note: LeetCode's recentSubmissionList returns at most 20 submissions.
 * Deduplicates keeping only the most recent per unique titleSlug.
 */
async function getRecentFailedSubmissions(username) {
  const query = `
    query getRecentSubmissions($username: String!, $limit: Int!) {
      recentSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        statusDisplay
        timestamp
      }
    }
  `;

  const res = await fetch(LC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DevAct',
    },
    body: JSON.stringify({
      query,
      variables: { username, limit: 20 },
    }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode API error: ${res.status}`);
  }

  const data = await res.json();
  const submissions = data.data?.recentSubmissionList || [];

  const failed = submissions.filter(s => s.statusDisplay !== 'Accepted');

  // Deduplicate: keep most recent per titleSlug
  const seen = new Map();
  for (const sub of failed) {
    if (!seen.has(sub.titleSlug)) {
      seen.set(sub.titleSlug, {
        title: sub.title,
        titleSlug: sub.titleSlug,
        difficulty: null, // not available from this query
        verdict: sub.statusDisplay,
        link: `https://leetcode.com/problems/${sub.titleSlug}/`,
        editorialLink: `https://leetcode.com/problems/${sub.titleSlug}/editorial/`,
        submittedAt: new Date(parseInt(sub.timestamp) * 1000),
      });
    }
  }

  return Array.from(seen.values());
}

module.exports = { getLeetCodeStats, getRecentFailedSubmissions };
