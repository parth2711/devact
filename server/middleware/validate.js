const { body, validationResult } = require('express-validator');

const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateProfileUpdate = [
  body('githubUsername').optional()
    .matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)
    .withMessage('Invalid GitHub username'),
  body('codeforcesHandle').optional()
    .matches(/^[a-zA-Z0-9_-]{3,24}$/)
    .withMessage('Invalid Codeforces handle'),
  body('leetcodeUsername').optional()
    .matches(/^[a-zA-Z0-9_-]{3,25}$/)
    .withMessage('Invalid LeetCode username'),
  body('username').optional()
    .matches(/^[a-z0-9_-]{3,20}$/)
    .withMessage('Username must be 3-20 chars, lowercase alphanumeric'),
  body('npmPackages').optional().isArray({ max: 10 }),
  body('pypiPackages').optional().isArray({ max: 10 }),
  handle,
];

const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
  handle,
];

module.exports = { validateProfileUpdate, validatePasswordChange };
