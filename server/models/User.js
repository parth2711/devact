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
    // Optional — only required when enabling public profile.
    // sparse: true allows multiple null values with unique constraint.
    // NOTE: Verify behavior on your MongoDB Atlas version (7.x+ is fine).
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]{3,20}$/, 'Username must be 3-20 lowercase alphanumeric characters or underscores'],
    },
    isPublicProfile: {
      type: Boolean,
      default: false,
    },
    wakatimeApiKey: {
      type: String,
      select: false,
    },
    wakatimeConfiguredAt: {
      type: Date,
      default: null,
    },
    stackoverflowId: {
      type: String,
      trim: true,
    },
    npmPackages: {
      type: [{
        type: String,
        match: [/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/, 'Invalid npm package name']
      }],
      validate: [
        function(val) { return val.length <= 10; },
        '{PATH} exceeds the limit of 10 packages'
      ]
    },
    pypiPackages: {
      type: [{
        type: String,
        match: [/^([A-Z0-9]|[A-Z0-9][A-Z0-9._-]*[A-Z0-9])$/i, 'Invalid PyPI package name']
      }],
      validate: [
        function(val) { return val.length <= 10; },
        '{PATH} exceeds the limit of 10 packages'
      ]
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password and encrypt WakaTime key before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Encrypt WakaTime API key via AES-256-CBC
  if (this.isModified('wakatimeApiKey') && this.wakatimeApiKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(this.wakatimeApiKey);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    this.wakatimeApiKey = iv.toString('hex') + ':' + encrypted.toString('hex');
    this.wakatimeConfiguredAt = new Date(); // Reset configured timer on new key
  }

  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
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

// Decrypt WakaTime key with graceful degradation
userSchema.methods.getDecryptedWakatimeKey = function () {
  if (!this.wakatimeApiKey) return null;
  try {
    const textParts = this.wakatimeApiKey.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.warn(`[Encryption] Failed to decrypt WakaTime key for user ${this._id}. Returning null.`);
    return null;
  }
};

module.exports = mongoose.model('User', userSchema);
