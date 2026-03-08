const { getUserRepos } = require('../services/github.service');
const { getAggregateLanguages, getRepoDetails, getRepoLanguages, getRepoCommitActivity, getRepoTree } = require('../services/repo.service');

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

// @desc    Get details + languages + activity + tree for a specific repo
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

    // Fetch tree using the default branch from details
    let tree = [];
    try {
      tree = await getRepoTree(owner, repo, details.defaultBranch, token);
    } catch (e) {
      console.error('Failed to fetch tree: ', e.message);
    }

    res.json({ ...details, languages, activity, tree });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { generateRepoFeedback } = require('../services/ai.service');

// @desc    Generate AI feedback for a repository
// @route   POST /api/repos/:owner/:repo/feedback
// @access  Private
const getRepoFeedback = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = process.env.GITHUB_TOKEN;

    // Fetch the necessary parts to feed to the AI
    const [details, languages] = await Promise.all([
      getRepoDetails(owner, repo, token),
      getRepoLanguages(owner, repo, token),
    ]);

    let tree = [];
    try {
      tree = await getRepoTree(owner, repo, details.defaultBranch, token);
    } catch (e) {
      console.error('Failed to fetch tree for AI: ', e.message);
    }

    // Call Gemini
    const feedback = await generateRepoFeedback(details, languages, tree);

    res.json({ feedback });
  } catch (error) {
    console.error('AI Feedback Error:', error);
    res.status(500).json({ message: error.message || 'Error generating feedback' });
  }
};

module.exports = { getRepos, getLanguages, getRepoDetail, getRepoFeedback };
