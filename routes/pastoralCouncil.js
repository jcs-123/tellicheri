import express from "express";
import PastoralCouncil from "../models/pastoralCouncil.js";

const router = express.Router();

// Bulk insert
// Bulk insert
router.post("/bulk", async (req, res) => {
  try {
    const councilData = req.body;  // ✅ no destructuring "data"

    if (!councilData || typeof councilData !== "object") {
      return res.status(400).json({ message: "Invalid data format" });
    }

    await PastoralCouncil.deleteMany();
    const membersArray = [];

    Object.entries(councilData).forEach(([category, members]) => {
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
// Fetch single member by ID
// Fetch single member by ID
router.get("/:id", async (req, res) => {
  try {
    const member = await PastoralCouncil.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
