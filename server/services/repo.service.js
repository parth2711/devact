const GITHUB_API = 'https://api.github.com';

function headers(token) {
  const h = { Accept: 'application/vnd.github+json', 'User-Agent': 'DevAct' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function ghFetch(endpoint, token) {
  const res = await fetch(`${GITHUB_API}${endpoint}`, { headers: headers(token) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Get language breakdown for a specific repo.
 * Returns { JavaScript: 45000, Python: 12000, ... } (bytes per language)
 */
async function getRepoLanguages(owner, repo, token) {
  return ghFetch(`/repos/${owner}/${repo}/languages`, token);
}

/**
 * Get weekly commit activity for the last year (52 weeks).
 * Returns array of { week, total, days[] }
 */
async function getRepoCommitActivity(owner, repo, token) {
  const data = await ghFetch(`/repos/${owner}/${repo}/stats/participation`, token);
  return {
    owner: data.owner || [],
    all: data.all || [],
  };
}

/**
 * Get detailed info for a specific repo.
 */
async function getRepoDetails(owner, repo, token) {
  const data = await ghFetch(`/repos/${owner}/${repo}`, token);
  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    language: data.language,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    openIssues: data.open_issues_count,
    size: data.size,
    defaultBranch: data.default_branch,
    url: data.html_url,
    createdAt: data.created_at,
    updatedAt: data.pushed_at,
    isPrivate: data.private,
    topics: data.topics || [],
  };
}

/**
 * Aggregate language stats across all repos for a user.
 * Returns sorted array: [{ language, bytes, percentage }]
 */
async function getAggregateLanguages(username, token) {
  const repos = await ghFetch(`/users/${username}/repos?per_page=30&type=owner&sort=pushed`, token);
  const langTotals = {};

  const langPromises = repos.map((repo) =>
    ghFetch(`/repos/${repo.full_name}/languages`, token).catch(() => ({}))
  );

  const results = await Promise.allSettled(langPromises);

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      Object.entries(result.value).forEach(([lang, bytes]) => {
        langTotals[lang] = (langTotals[lang] || 0) + bytes;
      });
    }
  });

  const totalBytes = Object.values(langTotals).reduce((a, b) => a + b, 0);

  return Object.entries(langTotals)
    .map(([language, bytes]) => ({
      language,
      bytes,
      percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

module.exports = { getRepoLanguages, getRepoCommitActivity, getRepoDetails, getAggregateLanguages };
