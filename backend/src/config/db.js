const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("You have successfully connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed", err);
    throw err;
  }
};

module.exports = connectDB;
