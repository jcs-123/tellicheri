// routes/pastoralCouncil.js
import express from "express";
import PastoralCouncil from "../models/pastoralCouncil.js";

const router = express.Router();

// GET /
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
        // include priestId if you added it
        priestId: m.priestId || null
      });
    }
    res.json(groupedData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /:id
router.get("/:id", async (req, res) => {
  try {
    const member = await PastoralCouncil.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /bulk
router.post("/bulk", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ message: "Invalid data format" });
    }

    await PastoralCouncil.deleteMany({});
    const membersArray = [];
    for (const [category, members] of Object.entries(data)) {
      for (const m of members) membersArray.push({ ...m, category });
    }
    await PastoralCouncil.insertMany(membersArray);
    res.status(201).json({ message: "Pastoral council saved successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/:id/resolve-priest", async (req, res) => {
  const member = await PastoralCouncil.findById(req.params.id);
  if (!member) return res.status(404).json({ message: "Member not found" });
  const priest = await Priest.findOne({ name: member.name }).select("_id");
  if (!priest) return res.status(404).json({ message: "Priest not found" });
  res.json({ priestId: priest._id });
});

// 👇 THIS IS IMPORTANT
export default router;
// (Optional: also export named, harmless if present)
export { router };
