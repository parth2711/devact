const User = require('../models/User');
const SyncData = require('../models/SyncData');
const DailySnapshot = require('../models/DailySnapshot');
const UserGoals = require('../models/UserGoals');
const JournalEntry = require('../models/JournalEntry');
const bcrypt = require('bcryptjs');
const { COOKIE_OPTIONS } = require('./auth.controller');

const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' });
    const user = await User.findByIdAndUpdate(req.user._id, { name: name.trim() }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) {
      return res.status(400).json({ message: 'This account uses GitHub login and has no password.' });
    }
    const valid = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: 'Current password incorrect' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateEmail = (req, res) => {
  res.status(501).json({ message: 'Email change coming soon — requires email verification.' });
};

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (user.password) {
      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) return res.status(401).json({ message: 'Incorrect password' });
    }
    await Promise.all([
      User.findByIdAndDelete(req.user._id),
      SyncData.deleteOne({ userId: req.user._id }),
      DailySnapshot.deleteMany({ userId: req.user._id }),
      UserGoals.deleteOne({ userId: req.user._id }),
      JournalEntry.deleteMany({ userId: req.user._id }),
    ]);
    res.clearCookie('token', COOKIE_OPTIONS).json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { updateName, updatePassword, updateEmail, deleteAccount };