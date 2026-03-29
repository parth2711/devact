const express = require('express');
const router = express.Router();
const { getCPStats, getCPSubmissions, getLeetCode, getLeetCodeSubmissions, getPracticeReview, initCodeforcesVerification, checkCodeforcesVerification } = require('../controllers/cp.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/stats', protect, getCPStats);
router.get('/submissions', protect, getCPSubmissions);
router.get('/leetcode', protect, getLeetCode);
router.get('/leetcode/submissions', protect, getLeetCodeSubmissions);
router.get('/practice-review', protect, getPracticeReview);
router.get('/codeforces/verify/init', protect, initCodeforcesVerification);
router.post('/codeforces/verify/check', protect, checkCodeforcesVerification);

module.exports = router;