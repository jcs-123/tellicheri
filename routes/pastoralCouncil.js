// routes/pastoralCouncil.js
import express from "express";
import PastoralCouncil from "../models/pastoralCouncil.js";
import Priest from "../models/priest.js"; // 👈 needed for optional name matching

const router = express.Router();

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
        // Normalize priestId: treat "" or null as undefined
        let priestId = m.priestId;
        if (!priestId || String(priestId).trim() === "") {
          priestId = undefined;

          // OPTIONAL: try to resolve by exact priest name
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
    // Return a helpful error
    res.status(500).json({
      message: "Server error during council import",
      error: e?.message
    });
  }
});

export default router;
export { router };
