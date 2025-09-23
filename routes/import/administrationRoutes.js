import express from 'express';
import Administration from '../../models/Administration.js';

const router = express.Router();

// Import administration data
router.post('/administration', async (req, res) => {
    try {
        const administrationData = req.body;

        if (!Array.isArray(administrationData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const adminData of administrationData) {
            try {
                // Clean and format the data
                const cleanedData = cleanAdministrationData(adminData);

                // Check if administration record already exists
                const existingAdmin = await Administration.findOne({
                    $or: [
                        { id: cleanedData.id },
                        {
                            section: cleanedData.section,
                            category: cleanedData.category,
                            head_id: cleanedData.head_id,
                            name: cleanedData.name
                        }
                    ]
                });

                if (existingAdmin) {
                    // Update existing administration record
                    await Administration.findByIdAndUpdate(existingAdmin._id, cleanedData);
                    updatedCount++;
                } else {
                    // Insert new administration record
                    await Administration.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing administration record ${adminData.id || 'unknown'}:`, error);
                errors.push({
                    id: adminData.id || 'unknown',
                    name: adminData.name || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new administration records and updated ${updatedCount} existing ones successfully. ${errors.length} errors occurred.`,
            imported: importedCount,
            updated: updatedCount,
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

// Helper function to clean and format administration data
function cleanAdministrationData(data) {
    const cleaned = { ...data };

    // Convert display_order to number
    if (cleaned.display_order) {
        cleaned.display_order = parseInt(cleaned.display_order) || 0;
    } else {
        cleaned.display_order = 0;
    }

    // Handle empty strings for better data consistency
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '') {
            cleaned[key] = null;
        }
    });

    return cleaned;
}

export default router;