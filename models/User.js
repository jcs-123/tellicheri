const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userGroup: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String },
  email: { type: String },
  role: {
    type: String,
    enum: ["administrator", "developer", "user"],
    default: "user",
  },
  status: { type: Boolean, default: true } // ✅ true = Active, false = Inactive
});

module.exports = mongoose.model("User", userSchema);
