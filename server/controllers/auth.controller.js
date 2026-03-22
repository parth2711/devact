const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PATCH /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { 
      name, githubUsername, codeforcesHandle, leetcodeUsername, username, isPublicProfile,
      wakatimeApiKey, stackoverflowId, npmPackages, pypiPackages
    } = req.body;

    // Guard: can't enable public profile without a username
    if (isPublicProfile === true) {
      const currentUser = await User.findById(req.user._id);
      const effectiveUsername = username || currentUser.username;
      if (!effectiveUsername) {
        return res.status(400).json({ message: 'Please set a username before enabling your public profile.' });
      }
    }

    const updateQuery = { $set: {}, $unset: {} };

    if (name) updateQuery.$set.name = name;
    if (githubUsername !== undefined) updateQuery.$set.githubUsername = githubUsername;
    if (codeforcesHandle !== undefined) updateQuery.$set.codeforcesHandle = codeforcesHandle;
    if (leetcodeUsername !== undefined) updateQuery.$set.leetcodeUsername = leetcodeUsername;
    
    // Explicitly handle empty string to avoid regex validation errors for sparse index
    if (username) {
      updateQuery.$set.username = username;
    } else if (username === '') {
      updateQuery.$unset.username = 1;
      updateQuery.$set.isPublicProfile = false; // Turn off public if username is cleared
    }

    if (stackoverflowId !== undefined) updateQuery.$set.stackoverflowId = stackoverflowId;
    if (npmPackages !== undefined) updateQuery.$set.npmPackages = npmPackages;
    if (pypiPackages !== undefined) updateQuery.$set.pypiPackages = pypiPackages;

    // Handle WakaTime Key explicitly to trigger Document pre('save') encryption middleware
    if (wakatimeApiKey !== undefined) {
      const doc = await User.findById(req.user._id);
      if (wakatimeApiKey === '') {
        doc.wakatimeApiKey = undefined;
        doc.wakatimeConfiguredAt = null;
      } else {
        doc.wakatimeApiKey = wakatimeApiKey;
      }
      await doc.save();
    }

    if (isPublicProfile !== undefined && username !== '') {
      updateQuery.$set.isPublicProfile = isPublicProfile;
    }

    // Clean up empty $set or $unset to avoid Mongo errors
    if (Object.keys(updateQuery.$set).length === 0) delete updateQuery.$set;
    if (Object.keys(updateQuery.$unset).length === 0) delete updateQuery.$unset;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateQuery,
      { new: true, runValidators: true }
    );

    res.json(user);
  } catch (error) {
    // Handle duplicate username error
    if (error.code === 11000 && error.keyPattern?.username) {
      return res.status(400).json({ message: 'This username is already taken.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const frontendResetUrl = `${frontendUrl}/resetpassword/${resetToken}`;

    console.log(`\n=================================\nPASSWORD RESET LINK:\n${frontendResetUrl}\n=================================\n`);

    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ message: 'Email could not be sent' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, updateProfile, forgotPassword, resetPassword };
