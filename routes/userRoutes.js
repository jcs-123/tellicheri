// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const { userGroup, name, username, password, mobile, email } = req.body;

    const roleMap = {
      Administrator: "administrator",
      Developer: "developer",
      Guest: "guest",
    };

    if (!roleMap[userGroup]) {
      return res.status(400).json({ message: "Invalid user group selected" });
    }

    const role = roleMap[userGroup];

    if (!name || !username || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const user = new User({
      userGroup,
      name,
      username,
      password,
      mobile,
      email,
      role,
    });

    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ✅ Update user status (active/inactive)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await User.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
});
// Update user details
router.put("/:id", async (req, res) => {
  try {
    const { name, username, email, userGroup } = req.body;
    const role = userGroup.toLowerCase();
    await User.findByIdAndUpdate(req.params.id, { name, username, email, userGroup, role });
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});

// Update password
router.patch("/:id/password", async (req, res) => {
  try {
    const { password } = req.body;
    await User.findByIdAndUpdate(req.params.id, { password });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating password" });
  }
});
// Update password by username (for Admin password reset)
router.put("/by-username/:username/password", async (req, res) => {
  try {
    const { username } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword; // Consider hashing here if needed
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
