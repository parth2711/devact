const express = require('express');
const router = express.Router();
const { getGithubRepos, getGithubActivity, getGithubStats } = require('../controllers/github.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/repos', protect, getGithubRepos);
router.get('/activity', protect, getGithubActivity);
router.get('/stats', protect, getGithubStats);

module.exports = router;
