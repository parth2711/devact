const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.updateOne({ email: 'jangirparth3@gmail.com' }, {
      $unset: { githubId: 1 },
      $set: { isGithubVerified: false }
    });
    console.log("Successfully cleared the mock GitHub verification data.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
