const express = require('express');
const router = express.Router();
const { getEntries, getTodayEntry, upsertTodayEntry, deleteTodayEntry } = require('../controllers/journal.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/',       protect, getEntries);
router.get('/today',  protect, getTodayEntry);
router.put('/today',  protect, upsertTodayEntry);
router.delete('/today', protect, deleteTodayEntry);

module.exports = router;
