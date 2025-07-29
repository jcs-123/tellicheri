// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/", async (req, res) => {
  const { userGroup, name, username, password, mobile, email } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const role = userGroup.toLowerCase(); // Map userGroup to role (e.g., 'Administrator' → 'administrator')

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
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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

module.exports = router;
