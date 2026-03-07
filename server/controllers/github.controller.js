// @desc    Get GitHub activity for authenticated user
// @route   GET /api/github/activity
// @access  Private
const getGithubActivity = async (req, res) => {
  // TODO: Implement GitHub API integration
  res.json({ message: 'GitHub activity endpoint — coming soon' });
};

// @desc    Get GitHub repositories
// @route   GET /api/github/repos
// @access  Private
const getGithubRepos = async (req, res) => {
  // TODO: Implement GitHub repos fetching
  res.json({ message: 'GitHub repos endpoint — coming soon' });
};

module.exports = { getGithubActivity, getGithubRepos };
