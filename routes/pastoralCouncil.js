// routes/pastoralCouncil.js
import express from "express";
import PastoralCouncil from "../models/pastoralCouncil.js";
import Priest from "../models/priest.js";

const router = express.Router();

// GET all (grouped by category)
router.get("/", async (req, res) => {
  try {
    const members = await PastoralCouncil.find().lean();
    const groupedData = {};
    for (const m of members) {
      if (!groupedData[m.category]) groupedData[m.category] = [];
      groupedData[m.category].push({
        _id: m._id,
        name: m.name,
        designation: m.designation,
        address: m.address,
        priestId: m.priestId || null
      });
    }
    res.json(groupedData);
  } catch (e) {
    console.error("Error fetching pastoral council:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single member by ID
router.get("/:id", async (req, res) => {
  try {
    const member = await PastoralCouncil.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(member);
  } catch (e) {
    console.error("Error fetching member:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /bulk
router.post("/bulk", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ message: "Invalid data format: expected { data: { [category]: Member[] } }" });
    }

    await PastoralCouncil.deleteMany({});
    const membersArray = [];

    for (const [category, members] of Object.entries(data)) {
      for (const m of members) {
        let priestId = m.priestId;
        if (!priestId || String(priestId).trim() === "") {
          priestId = undefined;
          if (m.name) {
            const priest = await Priest.findOne({ name: m.name }).select("_id").lean();
            if (priest) priestId = priest._id;
          }
        }

        membersArray.push({
          category,
          name: m.name,
          designation: m.designation,
          address: m.address,
          priestId
        });
      }
    }

    const inserted = await PastoralCouncil.insertMany(membersArray, { ordered: false });
    res.status(201).json({ message: "Pastoral council saved successfully", count: inserted.length });
  } catch (e) {
    console.error("Bulk council import error:", e);
    res.status(500).json({
      message: "Server error during council import",
      error: e?.message
    });
  }
});

export default router;
