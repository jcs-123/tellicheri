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

    // Transform rows: [["label","value"]] → [{label:"", value:""}]
    const transformedData = data.map(section => ({
      title: section.title,
      rows: section.rows.map(row =>
        Array.isArray(row) ? { label: row[0], value: row[1] } : row
      )
    }));

    await Statistics.deleteMany(); // optional: clears previous data
    await Statistics.insertMany(transformedData);

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
