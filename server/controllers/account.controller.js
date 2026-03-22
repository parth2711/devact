const User = require('../models/User');
const SyncData = require('../models/SyncData');
const DailySnapshot = require('../models/DailySnapshot');
const bcrypt = require('bcryptjs');
const { COOKIE_OPTIONS } = require('./auth.controller');

// @desc    Update display name
// @route   PATCH /api/account/name
// @access  Private
const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Change password
// @route   PATCH /api/account/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses GitHub login and has no password to update.' });
    }

    const valid = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: 'Current password incorrect' });

    user.password = await bcrypt.hash(req.body.newPassword, 12);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Email change – stub (requires mailer setup)
// @route   PATCH /api/account/email
// @access  Private
const updateEmail = (req, res) => {
  res.status(501).json({ message: 'Email change coming soon. Requires email verification.' });
};

// @desc    Delete account and all associated data
// @route   DELETE /api/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    // Password-based accounts require confirmation
    if (user.password) {
      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) return res.status(401).json({ message: 'Incorrect password' });
    }

    await Promise.all([
      User.findByIdAndDelete(req.user._id),
      SyncData.deleteOne({ userId: req.user._id }),
      DailySnapshot.deleteMany({ userId: req.user._id }),
    ]);

    res.clearCookie('token', COOKIE_OPTIONS).json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { updateName, updatePassword, updateEmail, deleteAccount };
