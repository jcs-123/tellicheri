import express from "express";
import Statistics from "../models/statistics.js";

const router = express.Router();

// Bulk insert
router.post("/bulk", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    await Statistics.deleteMany(); // optional reset
    await Statistics.insertMany(data);

    res.status(201).json({ message: "Statistics saved successfully" });
  } catch (error) {
    console.error("Error saving statistics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch all
router.get("/", async (req, res) => {
  try {
    const stats = await Statistics.find();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
