const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './server/.env' });

const User = require('./server/models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'jangirparth3@gmail.com' }).select('+password +githubId');
  console.log(user);
  process.exit(0);
})();
