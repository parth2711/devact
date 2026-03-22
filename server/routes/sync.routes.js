const express = require('express');
const router = express.Router();
const { triggerSync, getSyncStatus } = require('../controllers/sync.controller');
const { protect } = require('../middleware/auth.middleware');

const { syncLimiter } = require('../middleware/rateLimiter');

router.post('/now', protect, syncLimiter, triggerSync);
router.get('/status', protect, getSyncStatus);

module.exports = router;
