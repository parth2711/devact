const express = require('express');
const router = express.Router();
const { getRepos, getLanguages, getRepoDetail, getRepoFeedback } = require('../controllers/repo.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getRepos);
router.get('/languages', protect, getLanguages);
router.get('/:owner/:repo', protect, getRepoDetail);
router.post('/:owner/:repo/feedback', protect, getRepoFeedback);

module.exports = router;
