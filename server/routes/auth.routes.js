const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, updateProfile, forgotPassword, resetPassword, COOKIE_OPTIONS } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateProfileUpdate } = require('../middleware/validate');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.patch('/profile', protect, validateProfileUpdate, updateProfile);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/connect', protect, (req, res, next) => {
  req.session.connectUserId = req.user._id;
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed` }),
  (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Generate JWT and set as httpOnly cookie
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
    res.cookie('token', token, COOKIE_OPTIONS);
    // Redirect to frontend — no token in URL
    res.redirect(`${frontendUrl}/oauth/callback`);
  }
);

module.exports = router;

