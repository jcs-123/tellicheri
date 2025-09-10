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


// Get single member by ID
// Get single member by ID
// In your backend routes file
// In your backend route
router.get("/", async (req, res) => {
  try {
    const councils = await PastoralCouncil.find().lean(); // .lean() returns plain JS objects
    // Group by category
    const groupedData = {};
    councils.forEach(council => {
      if (!groupedData[council.category]) {
        groupedData[council.category] = [];
      }
      groupedData[council.category].push(council);
    });
    res.json(groupedData);
  } catch (error) {
    console.error("Error fetching pastoral council:", error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
