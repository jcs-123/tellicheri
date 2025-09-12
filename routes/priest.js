// routes/priest.js
import express from "express";
import Priest from "../models/priest.js";

const router = express.Router();

// Bulk insert priests
// routes/priest.js
router.post("/bulk", async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: "Expected { data: Priest[] }" });
    }
    await Priest.deleteMany({});
    const inserted = await Priest.insertMany(data, { ordered: false });
    res.status(201).json({ count: inserted.length });
  } catch (e) {
    console.error("Bulk priests import error:", e);
    res.status(500).json({ message: "Server error during priests import", error: e?.message });
  }
});


// Read one priest
router.get("/:id", async (req, res) => {
  const priest = await Priest.findById(req.params.id);
  if (!priest) return res.status(404).json({ message: "Not found" });
  res.json(priest);
});

export default router;
