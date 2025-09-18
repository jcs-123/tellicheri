import express from 'express';
import Parish from '../models/Parish.js';
import Priest from '../models/Priest.js';
import PriestOthers from '../models/Priestothers.js';
import Administration from '../models/Administration.js';
import Institution from '../models/Institution.js'; // Import the new model

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Import API is working!',
        timestamp: new Date().toISOString()
    });
});

router.post('/test', (req, res) => {
    res.json({
        success: true,
        message: 'POST request received!',
        data: req.body,
        timestamp: new Date().toISOString()
    });
});

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

// Import priests data with proper date handling
router.post('/priests', async (req, res) => {
    try {
        const priestsData = req.body;

        if (!Array.isArray(priestsData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const priestData of priestsData) {
            try {
                // Clean and format the data
                const cleanedData = cleanPriestData(priestData);

                // Check if priest already exists
                const existingPriest = await Priest.findOne({
                    $or: [
                        { id: cleanedData.id },
                        { email: cleanedData.email },
                        { mobile: cleanedData.mobile }
                    ]
                });

                if (existingPriest) {
                    // Update existing priest
                    await Priest.findByIdAndUpdate(existingPriest._id, cleanedData);
                    updatedCount++;
                } else {
                    // Insert new priest
                    await Priest.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing priest ${priestData.id || 'unknown'}:`, error);
                errors.push({
                    id: priestData.id || 'unknown',
                    name: priestData.name || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new priests and updated ${updatedCount} existing priests successfully. ${errors.length} errors occurred.`,
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

// Helper function to clean and format priest data
function cleanPriestData(data) {
    const cleaned = { ...data };

    const dateFields = [
        'baptism_date', 'dob', 'join_seminary', 'ordination_date',
        'profession_date', 'death_date'
    ];

    dateFields.forEach(field => {
        if (cleaned[field] && cleaned[field] !== '0000-00-00' && cleaned[field] !== '') {
            const parsedDate = new Date(cleaned[field]);
            cleaned[field] = isNaN(parsedDate.getTime()) ? null : parsedDate;
        } else {
            cleaned[field] = null;
        }
    });

    return cleaned;
}



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

// Import priest status data
router.post('/priest-others', async (req, res) => {
    try {
        const statusData = req.body;

        if (!Array.isArray(statusData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let errors = [];

        for (const item of statusData) {
            try {
                const existingStatus = await PriestStatus.findOne({
                    $or: [{ id: item.id }, { name: item.name }]
                });

                if (existingStatus) {
                    await PriestStatus.findByIdAndUpdate(existingStatus._id, item);
                } else {
                    await PriestStatus.create(item);
                }

                importedCount++;
            } catch (error) {
                console.error(`Error processing status ${item.id}:`, error);
                errors.push({ id: item.id, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} status records successfully. ${errors.length} errors occurred.`,
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


// Fetch all priests
router.get('/priests', async (req, res) => {
    try {
        const { search } = req.query;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } },
                    { current_place: { $regex: search, $options: 'i' } },
                ],
            };
        }

        const priests = await Priest.find(filter).sort({ name: 1 });

        res.json({
            success: true,
            count: priests.length,
            data: priests,
        });
    } catch (error) {
        console.error('Error fetching priests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priests',
        });
    }
});
// ✅ Fetch obituary priests first
router.get('/priests/obituary', async (req, res) => {
    try {
        const { filter } = req.query;
        const year = 2020;

        console.log("🔍 Fetching obituary with filter:", filter);

        let query = { death_date: { $ne: null } };

        if (filter === "after") {
            query.$and = [{ death_date: { $gte: new Date(`${year}-01-01`) } }];
        } else if (filter === "before") {
            query.$and = [{ death_date: { $lt: new Date(`${year}-01-01`) } }];
        }


        console.log("👉 Final Mongo Query:", query);

        const priests = await Priest.find(query).sort({ death_date: -1 }).lean();

        console.log("✅ Priests found:", priests.length);
        res.json({ success: true, count: priests.length, data: priests });
    } catch (error) {
        console.error("❌ Error fetching obituary:", error);
        res.status(500).json({ success: false, message: "Server error while fetching obituary" });
    }
});

// 👇 Place dynamic route after
router.get('/priests/:id', async (req, res) => {
    try {
        const priest = await Priest.findById(req.params.id);
        if (!priest) {
            return res.status(404).json({ success: false, message: 'Priest not found' });
        }
        res.json({ success: true, data: priest });
    } catch (error) {
        console.error('Error fetching priest details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});





export default router;