const mongoose = require('mongoose');

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }
  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    global.mongoose.promise = mongoose.connect(process.env.MONGO_URI, opts).then((instance) => {
      console.log(`MongoDB Connected: ${instance.connection.host}`);
      return instance;
    });
  }
  try {
    global.mongoose.conn = await global.mongoose.promise;
  } catch (error) {
    global.mongoose.promise = null; // Reset cache on failure
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
  return global.mongoose.conn;
};

module.exports = connectDB;
