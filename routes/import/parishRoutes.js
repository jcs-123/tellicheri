// routes/parishRoutes.js
import express from "express";
import Parish from "../../models/Parish.js";

const router = express.Router();

// ✅ GET /api/parishes
router.get("/", async (req, res) => {
  console.log("📥 GET /api/parishes hit");   // <-- Debug log
  try {
    const parishes = await Parish.find().sort({ name: 1 });
    console.log(`📊 Found ${parishes.length} parishes`);
    res.json({ success: true, count: parishes.length, data: parishes });
  } catch (error) {
    console.error("❌ Error fetching parishes:", error);
    res.status(500).json({ success: false, message: "Error fetching parishes" });
  }
});

// ✅ POST /api/parishes (import)
router.post("/", async (req, res) => {
  console.log("📥 POST /api/parishes hit with", req.body.length, "records");
  try {
    const parishesData = req.body;

    if (!Array.isArray(parishesData)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format. Expected an array of parishes.",
      });
    }

    let importedCount = 0;
    let errors = [];

    for (const parish of parishesData) {
      try {
        const existingParish = await Parish.findOne({
          $or: [{ id: parish.id }, { archival_code: parish.archival_code }],
        });

        if (existingParish) {
          console.log(`🔄 Updating parish ${parish.name}`);
          await Parish.findByIdAndUpdate(existingParish._id, parish);
        } else {
          console.log(`➕ Creating parish ${parish.name}`);
          await Parish.create(parish);
        }

        importedCount++;
      } catch (error) {
        console.error(`❌ Error processing parish ${parish.id}:`, error);
        errors.push({ id: parish.id, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Imported ${importedCount} parishes successfully. ${errors.length} errors occurred.`,
      errors,
    });
  } catch (error) {
    console.error("❌ Import error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during import",
    });
  }
});

export default router;
