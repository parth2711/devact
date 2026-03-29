const express = require('express');
const router = express.Router();
const { getStreak } = require('../controllers/streak.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getStreak);

module.exports = router;
