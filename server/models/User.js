const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: [
        function() { return !this.githubId; },
        'Please add a password'
      ],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    githubUsername: {
      type: String,
      default: '',
      trim: true,
    },
    codeforcesHandle: {
      type: String,
      default: '',
      trim: true,
    },
    leetcodeUsername: {
      type: String,
      default: '',
      trim: true,
    },
    githubId: {
      type: String,
      sparse: true,
      unique: true,
    },
    isGithubVerified: {
      type: Boolean,
      default: false,
    },
    isCodeforcesVerified: {
      type: Boolean,
      default: false,
    },
    codeforcesVerificationToken: {
      type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
