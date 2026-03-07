const express = require('express');
const router = express.Router();
const { getCPStats, getCPSubmissions, getLeetCode } = require('../controllers/cp.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/stats', protect, getCPStats);
router.get('/submissions', protect, getCPSubmissions);
router.get('/leetcode', protect, getLeetCode);

module.exports = router;
