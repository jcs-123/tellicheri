// routes/pastoralCouncil.js
import express from "express";
import PastoralCouncil from "../models/pastoralCouncil.js";
import Priest from "../models/priest.js"; // Import Priest model

const router = express.Router();

// Fetch all pastoral council members grouped by category
router.get("/", async (req, res) => {
  try {
    const members = await PastoralCouncil.find().lean();
    const groupedData = {};

    members.forEach(member => {
      if (!groupedData[member.category]) groupedData[member.category] = [];
      groupedData[member.category].push({
        _id: member._id,
        name: member.name,
        designation: member.designation,
        address: member.address
      });
    });

    res.json(groupedData);
  } catch (error) {
    console.error("Error fetching pastoral council:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch single member by ID - check both collections
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // First try to find in Pastoral Council
    let member = await PastoralCouncil.findById(id);
    
    // If not found, try to find in Priests collection by name
    if (!member) {
      // If you have a reference to priest ID in pastoral council, use that
      // Otherwise, search by name (this is less reliable)
      const pastoralMember = await PastoralCouncil.findById(id);
      if (pastoralMember) {
        member = await Priest.findOne({ name: pastoralMember.name });
      }
    }
    
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    res.json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Search priests by name (for linking)
router.get("/search/priest/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const priest = await Priest.findOne({ name: new RegExp(name, 'i') });
    
    if (!priest) {
      return res.status(404).json({ message: "Priest not found" });
    }
    
    res.json(priest);
  } catch (error) {
    console.error("Error searching priest:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Bulk insert for pastoral council
router.post("/bulk", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ message: "Invalid data format" });
    }

    await PastoralCouncil.deleteMany();
    const membersArray = [];

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

// Bulk insert for priests
router.post("/bulk/priests", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    await Priest.deleteMany();
    await Priest.insertMany(data);
    res.status(201).json({ message: "Priests saved successfully" });
  } catch (error) {
    console.error("Error saving priests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;