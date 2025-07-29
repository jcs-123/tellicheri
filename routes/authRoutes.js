// routes/authRoutes.js
import express from "express";
import User from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.status) {
      return res.status(403).json({ message: "User is inactive" });
    }

    await logActivity(
      user.username,
      `${user.username} - ${user.userGroup} logged in successfully`,
      "Sign In"
    );

    res.json({
      token: "dummy-token",
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Logout route
router.post("/logout", async (req, res) => {
  const { username } = req.body;

  try {
    await logActivity(
      username,
      `${username} signed out successfully`,
      "Sign Out"
    );
    res.json({ message: "Logout logged successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error logging logout" });
  }
});

export default router;
