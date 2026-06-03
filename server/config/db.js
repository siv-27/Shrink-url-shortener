const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to primary MongoDB URI...");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(`Primary MongoDB connection failed (${error.message}). Trying local fallback (mongodb://127.0.0.1:27017/url)...`);
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/url", { serverSelectionTimeoutMS: 3000 });
      console.log("MongoDB Connected (Local Fallback)");
    } catch (fallbackError) {
      console.log(`Local MongoDB connection failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;