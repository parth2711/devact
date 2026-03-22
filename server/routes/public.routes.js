const express = require('express');
const router = express.Router();
const { getPublicProfile } = require('../controllers/public.controller');

const { publicLimiter } = require('../middleware/rateLimiter');

router.get('/:username', publicLimiter, getPublicProfile);

module.exports = router;
