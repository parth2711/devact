const express = require('express');
const router = express.Router();
const { getPublicProfile } = require('../controllers/public.controller');

router.get('/:username', getPublicProfile);

module.exports = router;
