const express = require('express');
const router = express.Router();
const { updateName, updatePassword, updateEmail, deleteAccount } = require('../controllers/account.controller');
const { protect } = require('../middleware/auth.middleware');
const { validatePasswordChange } = require('../middleware/validate');

router.patch('/name', protect, updateName);
router.patch('/password', protect, validatePasswordChange, updatePassword);
router.patch('/email', protect, updateEmail);
router.delete('/', protect, deleteAccount);

module.exports = router;
