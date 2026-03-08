const { getUserRepos } = require('../services/github.service');
const { getAggregateLanguages, getRepoDetails, getRepoLanguages, getRepoCommitActivity } = require('../services/repo.service');

// @desc    Get top repos with language info
// @route   GET /api/repos
// @access  Private
const getRepos = async (req, res) => {
  try {
    const username = req.user.githubUsername;
    if (!username) {
      return res.status(400).json({ message: 'GitHub username not set. Update your profile first.' });
    }

    const repos = await getUserRepos(username, process.env.GITHUB_TOKEN);
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get aggregate language breakdown across all repos
// @route   GET /api/repos/languages
// @access  Private
const getLanguages = async (req, res) => {
  try {
    const username = req.user.githubUsername;
    if (!username) {
      return res.status(400).json({ message: 'GitHub username not set. Update your profile first.' });
    }

    const languages = await getAggregateLanguages(username, process.env.GITHUB_TOKEN);
    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get details + languages + activity for a specific repo
// @route   GET /api/repos/:owner/:repo
// @access  Private
const getRepoDetail = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = process.env.GITHUB_TOKEN;

    const [details, languages, activity] = await Promise.all([
      getRepoDetails(owner, repo, token),
      getRepoLanguages(owner, repo, token),
      getRepoCommitActivity(owner, repo, token),
    ]);

    res.json({ ...details, languages, activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRepos, getLanguages, getRepoDetail };
