const express = require('express');
const router = express.Router();
const { getCPStats, getCPSubmissions } = require('../controllers/cp.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/stats', protect, getCPStats);
router.get('/submissions', protect, getCPSubmissions);

module.exports = router;
