import express from 'express';
import Forane from '../../models/Forane.js';

const router = express.Router();

// Import forane data
router.post('/foranes', async (req, res) => {
    try {
        const foraneData = req.body;

        if (!Array.isArray(foraneData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const foraneItem of foraneData) {
            try {
                // Clean and format the data
                const cleanedData = cleanForaneData(foraneItem);

                // Check if forane already exists
                const existingForane = await Forane.findOne({
                    $or: [
                        { id: cleanedData.id },
                        { archival_code: cleanedData.archival_code },
                        { name: cleanedData.name, place: cleanedData.place }
                    ]
                });

                if (existingForane) {
                    // Update existing forane
                    await Forane.findByIdAndUpdate(existingForane._id, cleanedData);
                    updatedCount++;
                } else {
                    // Insert new forane
                    await Forane.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing forane ${foraneItem.id || 'unknown'}:`, error);
                errors.push({
                    id: foraneItem.id || 'unknown',
                    name: foraneItem.name || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new foranes and updated ${updatedCount} existing ones successfully. ${errors.length} errors occurred.`,
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

// Helper function to clean and format forane data
function cleanForaneData(data) {
    const cleaned = { ...data };

    // Convert date strings to Date objects
    const dateFields = ['inserted_date', 'updated_date'];

    dateFields.forEach(field => {
        if (cleaned[field] && cleaned[field] !== '0000-00-00 00:00:00' && cleaned[field] !== '') {
            cleaned[field] = new Date(cleaned[field]);
        } else {
            cleaned[field] = null;
        }
    });

    // Handle empty strings for better data consistency
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === '0000-00-00 00:00:00') {
            cleaned[key] = null;
        }
    });

    return cleaned;
}

export default router;