import express from 'express';
import PriestOthers from '../../models/Priestothers.js';

const router = express.Router();

// Import priest others data with proper date handling
router.post('/priest-others', async (req, res) => {
    try {
        const priestOthersData = req.body;

        if (!Array.isArray(priestOthersData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const priestOtherData of priestOthersData) {
            try {
                // Clean and format the data
                const cleanedData = cleanPriestOtherData(priestOtherData);

                // Check if priest other already exists
                const existingPriestOther = await PriestOthers.findOne({
                    $or: [
                        { id: cleanedData.id },
                        { mobile: cleanedData.mobile },
                        { name: cleanedData.name, designation: cleanedData.designation }
                    ]
                });

                if (existingPriestOther) {
                    // Update existing priest other
                    await PriestOthers.findByIdAndUpdate(existingPriestOther._id, cleanedData);
                    updatedCount++;
                } else {
                    // Insert new priest other
                    await PriestOthers.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing priest other ${priestOtherData.id || 'unknown'}:`, error);
                errors.push({
                    id: priestOtherData.id || 'unknown',
                    name: priestOtherData.name || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new priest others and updated ${updatedCount} existing ones successfully. ${errors.length} errors occurred.`,
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

// Helper function to clean and format priest other data
function cleanPriestOtherData(data) {
    const cleaned = { ...data };

    // Convert date strings to Date objects
    const dateFields = [
        'ordination_date', 'dob', 'feast_date', 'date_profession', 'death_date'
    ];

    dateFields.forEach(field => {
        if (cleaned[field] && cleaned[field] !== '0000-00-00' && cleaned[field] !== '') {
            cleaned[field] = new Date(cleaned[field]);
        } else {
            cleaned[field] = null;
        }
    });

    // Handle empty strings for better data consistency
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === '0000-00-00') {
            cleaned[key] = null;
        }
    });

    return cleaned;
}

export default router;