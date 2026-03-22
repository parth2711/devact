const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'jangirparth3@gmail.com' }).select('+password +githubId');
  console.log('User found:', !!user);
  if (user) {
    console.log('User password defined:', !!user.password);
    console.log('User githubId:', user.githubId);
  }
  process.exit(0);
})();
