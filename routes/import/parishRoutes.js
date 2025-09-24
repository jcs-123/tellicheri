import express from 'express';
import Parish from '../../models/Parish.js';

const router = express.Router();


router.get("/parishes", async (req, res) => {
  try {
    const parishes = await Parish.find().sort({ name: 1 });
    res.json({ success: true, count: parishes.length, data: parishes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching parishes" });
  }
});


// Import parishes data
router.post('/parishes', async (req, res) => {
    try {
        const parishesData = req.body;

        // Validate that we received an array
        if (!Array.isArray(parishesData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array of parishes.'
            });
        }

        // Process each parish
        let importedCount = 0;
        let errors = [];

        for (const parish of parishesData) {
            try {
                // Check if parish already exists
                const existingParish = await Parish.findOne({
                    $or: [{ id: parish.id }, { archival_code: parish.archival_code }]
                });

                if (existingParish) {
                    // Update existing parish
                    await Parish.findByIdAndUpdate(existingParish._id, parish);
                } else {
                    // Insert new parish
                    await Parish.create(parish);
                }

                importedCount++;
            } catch (error) {
                console.error(`Error processing parish ${parish.id}:`, error);
                errors.push({ id: parish.id, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} parishes successfully. ${errors.length} errors occurred.`,
            errors: errors
        });

    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during import'
        });
    }
});

export default router;