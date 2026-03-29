const express = require('express');
const router = express.Router();
const { getGoals, saveGoals, toggleGoal } = require('../controllers/goals.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getGoals);
router.put('/', protect, saveGoals);
router.patch('/:id/toggle', protect, toggleGoal);

module.exports = router;
