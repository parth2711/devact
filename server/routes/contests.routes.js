const express = require('express');
const router = express.Router();
const { getContests } = require('../controllers/contests.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getContests);

module.exports = router;
