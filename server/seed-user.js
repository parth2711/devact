const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clean up any existing user with this email
    await User.deleteMany({ email: 'jangirparth3@gmail.com' });

    // Create mock OAuth user
    const user = await User.create({
      name: 'Parth Jangir',
      email: 'jangirparth3@gmail.com',
      githubId: 'mock_github_id_123',
      isGithubVerified: true,
    });
    
    console.log('Mock OAuth user seeded:', user.email);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
