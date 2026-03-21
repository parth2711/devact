const express = require('express');
const router = express.Router();
const { getSnapshots } = require('../controllers/snapshot.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getSnapshots);

module.exports = router;
