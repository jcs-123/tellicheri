const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userGroup: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: String,
  email: String,
  role: {
    type: String,
    enum: ["administrator", "developer", "guest", "user"], // Keep "user" for fallback
    default: "user",
  },
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("User", userSchema);
