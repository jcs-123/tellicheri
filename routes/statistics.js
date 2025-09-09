import express from "express";
import Statistics from "../models/statistics.js";

const router = express.Router();

// ✅ Add bulk statistics (admin uploads JSON)
router.post("/bulk", async (req, res) => {
  try {
    const { data } = req.body; // expect { data: [ {title, rows: [{label,value}]} ] }
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    await Statistics.deleteMany(); // optional: clear old data
    await Statistics.insertMany(data);

    res.status(201).json({ message: "Statistics saved successfully" });
  } catch (error) {
    console.error("Error saving statistics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all statistics
router.get("/", async (req, res) => {
  try {
    const stats = await Statistics.find();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
