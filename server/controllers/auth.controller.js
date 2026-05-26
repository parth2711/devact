const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      name, githubUsername, codeforcesHandle, leetcodeUsername,
      username, isPublicProfile, wakatimeApiKey,
      stackoverflowId, npmPackages, pypiPackages
    } = req.body;

    if (isPublicProfile === true) {
      const currentUser = await User.findById(req.user._id);
      const effectiveUsername = (username && username.trim()) || currentUser.username;
      if (!effectiveUsername) {
        return res.status(400).json({ message: 'Set a username before enabling your public profile.' });
      }
    }

    const setFields = {};
    const unsetFields = {};

    if (name)                          setFields.name              = name;
    if (githubUsername   !== undefined) setFields.githubUsername    = githubUsername;
    if (codeforcesHandle !== undefined) setFields.codeforcesHandle  = codeforcesHandle;
    if (leetcodeUsername !== undefined) setFields.leetcodeUsername  = leetcodeUsername;
    if (stackoverflowId  !== undefined) setFields.stackoverflowId   = stackoverflowId;
    if (npmPackages      !== undefined) setFields.npmPackages       = npmPackages;
    if (pypiPackages     !== undefined) setFields.pypiPackages      = pypiPackages;

    if (username && username.trim()) {
      setFields.username = username.trim();
    } else if (username === '') {
      unsetFields.username    = 1;
      setFields.isPublicProfile = false;
    }

    if (isPublicProfile !== undefined && username !== '') {
      setFields.isPublicProfile = isPublicProfile;
    }

    if (wakatimeApiKey !== undefined) {
      const doc = await User.findById(req.user._id).select('+wakatimeApiKey');
      if (wakatimeApiKey === '') {
        doc.wakatimeApiKey       = undefined;
        doc.wakatimeConfiguredAt = null;
      } else {
        doc.wakatimeApiKey = wakatimeApiKey;
      }
      await doc.save();
    }

    const updateQuery = {};
    if (Object.keys(setFields).length   > 0) updateQuery.$set   = setFields;
    if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

    if (Object.keys(updateQuery).length === 0) {
      const user = await User.findById(req.user._id);
      return res.json(user);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateQuery,
      { new: true, runValidators: true }
    );

    res.json(user);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.username) {
      return res.status(400).json({ message: 'That username is already taken.' });
    }
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'No account with that email' });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const frontendResetUrl = `${frontendUrl}/resetpassword/${resetToken}`;

    console.log(`PASSWORD RESET LINK: ${frontendResetUrl}`);
    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      user.resetPasswordToken   = undefined;
      user.resetPasswordExpire  = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ message: 'Email could not be sent' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password            = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({
      user: { _id: user._id, name: user.name, email: user.email },
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS).json({ message: 'Logged out' });
};

module.exports = { registerUser, loginUser, logoutUser, getMe, updateProfile, forgotPassword, resetPassword, COOKIE_OPTIONS };