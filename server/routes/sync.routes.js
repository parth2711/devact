const express = require('express');
const router = express.Router();
const { triggerSync, getSyncStatus } = require('../controllers/sync.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/now', protect, triggerSync);
router.get('/status', protect, getSyncStatus);

module.exports = router;
