const express = require('express');
const router = express.Router();
const { getGithubActivity, getGithubRepos } = require('../controllers/github.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/activity', protect, getGithubActivity);
router.get('/repos', protect, getGithubRepos);

module.exports = router;
