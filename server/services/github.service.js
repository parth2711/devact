const GITHUB_API = 'https://api.github.com';

/**
 * Make an authenticated request to the GitHub API.
 */
async function githubFetch(endpoint, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'DevAct',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${GITHUB_API}${endpoint}`, { headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Get public repos for a user, sorted by most recently pushed.
 */
async function getUserRepos(username, token) {
  const repos = await githubFetch(
    `/users/${username}/repos?sort=pushed&per_page=30&type=owner`,
    token
  );

  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    url: repo.html_url,
    updatedAt: repo.pushed_at,
    isPrivate: repo.private,
  }));
}

/**
 * Get recent public events (commits, PRs, issues, etc.) for a user.
 */
async function getUserActivity(username, token) {
  const events = await githubFetch(
    `/users/${username}/events/public?per_page=30`,
    token
  );

  return events.map((event) => ({
    id: event.id,
    type: event.type,
    repo: event.repo.name,
    createdAt: event.created_at,
    payload: formatPayload(event),
  }));
}

/**
 * Get basic profile stats for a GitHub user.
 */
async function getUserStats(username, token) {
  const user = await githubFetch(`/users/${username}`, token);

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    profileUrl: user.html_url,
    createdAt: user.created_at,
  };
}

/**
 * Format event payload into a human-readable summary.
 */
function formatPayload(event) {
  switch (event.type) {
    case 'PushEvent':
      return {
        action: 'pushed',
        commits: event.payload.commits?.length || 0,
        branch: event.payload.ref?.replace('refs/heads/', ''),
      };
    case 'PullRequestEvent':
      return {
        action: event.payload.action,
        title: event.payload.pull_request?.title,
        number: event.payload.pull_request?.number,
      };
    case 'IssuesEvent':
      return {
        action: event.payload.action,
        title: event.payload.issue?.title,
        number: event.payload.issue?.number,
      };
    case 'CreateEvent':
      return {
        action: 'created',
        refType: event.payload.ref_type,
        ref: event.payload.ref,
      };
    case 'WatchEvent':
      return { action: 'starred' };
    case 'ForkEvent':
      return { action: 'forked', forkee: event.payload.forkee?.full_name };
    default:
      return { action: event.type.replace('Event', '').toLowerCase() };
  }
}

module.exports = { getUserRepos, getUserActivity, getUserStats };
