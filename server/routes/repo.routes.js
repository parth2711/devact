const express = require('express');
const router = express.Router();
const { getRepos, getLanguages, getRepoDetail } = require('../controllers/repo.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getRepos);
router.get('/languages', protect, getLanguages);
router.get('/:owner/:repo', protect, getRepoDetail);

module.exports = router;
