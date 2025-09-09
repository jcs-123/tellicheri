import express from "express";
import Statistic from "../models/Statistic.js";

const router = express.Router();

// ✅ Get all statistics
router.get("/", async (req, res) => {
  try {
    const stats = await Statistic.find();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add new statistic
router.post("/", async (req, res) => {
  try {
    const stat = new Statistic(req.body);
    await stat.save();
    res.json(stat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update statistic
router.put("/:id", async (req, res) => {
  try {
    const updated = await Statistic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete statistic
router.delete("/:id", async (req, res) => {
  try {
    await Statistic.findByIdAndDelete(req.params.id);
    res.json({ message: "Statistic deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
