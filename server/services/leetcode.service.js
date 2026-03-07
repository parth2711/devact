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

module.exports = { getLeetCodeStats };
