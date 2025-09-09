import express from "express";
import PastoralCouncil from "../models/pastoralCouncil.js";

const router = express.Router();

// Bulk insert
router.post("/bulk", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ message: "Invalid data format" });
    }

    await PastoralCouncil.deleteMany(); // optional reset
    const membersArray = [];

    // Convert grouped JSON to array of members
    Object.entries(data).forEach(([category, members]) => {
      members.forEach((m) => {
        membersArray.push({ ...m, category });
      });
    });

    await PastoralCouncil.insertMany(membersArray);
    res.status(201).json({ message: "Pastoral council saved successfully" });
  } catch (error) {
    console.error("Error saving pastoral council:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch all grouped by category
router.get("/", async (req, res) => {
  try {
    const members = await PastoralCouncil.find();
    const grouped = {};

    members.forEach((m) => {
      if (!grouped[m.category]) grouped[m.category] = [];
      grouped[m.category].push({ name: m.name, designation: m.designation, address: m.address });
    });

    res.json(grouped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
