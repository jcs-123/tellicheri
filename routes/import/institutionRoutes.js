import express from 'express';
import Institution from '../../models/Institution.js';

const router = express.Router();

// Import institutions data
router.post('/institutions', async (req, res) => {
    try {
        const institutionsData = req.body;

        if (!Array.isArray(institutionsData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const institutionData of institutionsData) {
            try {
                // Clean and format the data
                const cleanedData = cleanInstitutionData(institutionData);

                // Check if institution already exists
                const existingInstitution = await Institution.findOne({
                    $or: [
                        { id: cleanedData.id },
                        {
                            name: cleanedData.name,
                            place: cleanedData.place,
                            web_institution_type_id: cleanedData.web_institution_type_id
                        }
                    ]
                });

                if (existingInstitution) {
                    // Update existing institution
                    await Institution.findByIdAndUpdate(existingInstitution._id, cleanedData);
                    updatedCount++;
                } else {
                    // Insert new institution
                    await Institution.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing institution ${institutionData.id || 'unknown'}:`, error);
                errors.push({
                    id: institutionData.id || 'unknown',
                    name: institutionData.name || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new institutions and updated ${updatedCount} existing ones successfully. ${errors.length} errors occurred.`,
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

// Helper function to clean and format institution data
function cleanInstitutionData(data) {
    const cleaned = { ...data };

    // Convert estd to Date object if available
    if (cleaned.estd && cleaned.estd !== '') {
        cleaned.estd = new Date(cleaned.estd);
    } else {
        cleaned.estd = null;
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