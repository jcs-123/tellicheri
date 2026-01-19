import express from 'express';
import Parish from '../models/Parish.js';
import Priest from '../models/Priest.js';
import PriestOthers from '../models/Priestothers.js';
import Administration from '../models/Administration.js';
import Institution from '../models/Institution.js';
import Forane from '../models/Forane.js';
import PriestSubStatus from '../models/PriestSubStatus.js';
import PriestStatus from '../models/PriestStatus.js';
import PriestSecondarySubStatus from '../models/PriestSecondarySubStatus.js';
import PriestHistory from '../models/PriestHistory.js';
import PriestEducation from '../models/PriestEducation.js';
import PriestDesignation from '../models/PriestDesignation.js';

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

// ==================== INSTITUTIONS ====================
// Get all institutions
router.get('/institutions', async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { place: { $regex: search, $options: 'i' } },
                    { web_institution_type_id: { $regex: search, $options: 'i' } },
                ],
            };
        }

        const [institutions, total] = await Promise.all([
            Institution.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ name: 1 }),
            Institution.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: total,
            data: institutions,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching institutions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching institutions'
        });
    }
});

// Get single institution by ID
router.get('/institutions/:id', async (req, res) => {
    try {
        const institution = await Institution.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!institution) {
            return res.status(404).json({
                success: false,
                message: 'Institution not found'
            });
        }

        res.json({
            success: true,
            data: institution
        });
    } catch (error) {
        console.error('Error fetching institution:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching institution'
        });
    }
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
                const cleanedData = cleanInstitutionData(institutionData);
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
                    await Institution.findByIdAndUpdate(existingInstitution._id, cleanedData);
                    updatedCount++;
                } else {
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

function cleanInstitutionData(data) {
    const cleaned = { ...data };
    if (cleaned.estd && cleaned.estd !== '') {
        cleaned.estd = new Date(cleaned.estd);
    } else {
        cleaned.estd = null;
    }
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '') {
            cleaned[key] = null;
        }
    });
    return cleaned;
}

// ==================== EDUCATIONAL INSTITUTIONS ONLY ====================
router.get('/institutions', async (req, res) => {
    try {
        const { search } = req.query;

        let filter = {
            web_institution_type_id: "Educational Institutions",
            status: "A"
        };

        if (search && search.trim() !== "") {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { place: { $regex: search, $options: "i" } },
                { head: { $regex: search, $options: "i" } }
            ];
        }

        const institutions = await Institution.find(filter);

        res.json({
            success: true,
            count: institutions.length,
            data: institutions
        });

    } catch (error) {
        console.error("❌ Error fetching educational institutions:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching institutions"
        });
    }
});

router.get('/institutions/:id', async (req, res) => {
    try {
        const institution = await Institution.findById(req.params.id);

        if (!institution) {
            return res.status(404).json({
                success: false,
                message: "Institution not found"
            });
        }

        res.json({
            success: true,
            data: institution
        });

    } catch (error) {
        console.error("Error fetching institution:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


router.get('/social-charitable-institutions', async (req, res) => {
    try {
        const { search } = req.query;

        let filter = {
            web_institution_type_id: {
                $regex: "^Social\\s*&\\s*Charitable Institutions$",
                $options: "i"
            },
            status: "A"
        };

        if (search && search.trim() !== "") {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { place: { $regex: search, $options: "i" } },
                { head: { $regex: search, $options: "i" } }
            ];
        }

        const institutions = await Institution.find(filter);

        res.json({
            success: true,
            count: institutions.length,
            data: institutions
        });

    } catch (error) {
        console.error("❌ Error fetching social & charitable institutions:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching institutions"
        });
    }
});




// ==================== ADMINISTRATION ====================
// Get all administration records
router.get('/administration', async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { section: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { head_id: { $regex: search, $options: 'i' } },
                ],
            };
        }

        const [administration, total] = await Promise.all([
            Administration.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ display_order: 1 }),
            Administration.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: total,
            data: administration,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching administration:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching administration'
        });
    }
});

// Get single administration by ID
router.get('/administration/:id', async (req, res) => {
    try {
        const admin = await Administration.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Administration record not found'
            });
        }

        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        console.error('Error fetching administration:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching administration'
        });
    }
});

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
                const cleanedData = cleanAdministrationData(adminData);
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
                    await Administration.findByIdAndUpdate(existingAdmin._id, cleanedData);
                    updatedCount++;
                } else {
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

function cleanAdministrationData(data) {
    const cleaned = { ...data };
    if (cleaned.display_order) {
        cleaned.display_order = parseInt(cleaned.display_order) || 0;
    } else {
        cleaned.display_order = 0;
    }
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '') {
            cleaned[key] = null;
        }
    });
    return cleaned;
}

// ==================== FORANES ====================
// Get all foranes
router.get('/foranes', async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { place: { $regex: search, $options: 'i' } },
                    { vicar: { $regex: search, $options: 'i' } },
                ],
            };
        }

        const [foranes, total] = await Promise.all([
            Forane.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ name: 1 }),
            Forane.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: total,
            data: foranes,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching foranes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching foranes',
        });
    }
});

// Get single forane by ID
router.get('/foranes/:id', async (req, res) => {
    try {
        const forane = await Forane.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!forane) {
            return res.status(404).json({
                success: false,
                message: 'Forane not found'
            });
        }

        res.json({
            success: true,
            data: forane
        });
    } catch (error) {
        console.error('Error fetching forane:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching forane'
        });
    }
});

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
                const cleanedData = cleanForaneData(foraneItem);
                const existingForane = await Forane.findOne({
                    $or: [
                        { id: cleanedData.id },
                        { archival_code: cleanedData.archival_code },
                        { name: cleanedData.name, place: cleanedData.place }
                    ]
                });

                if (existingForane) {
                    await Forane.findByIdAndUpdate(existingForane._id, cleanedData);
                    updatedCount++;
                } else {
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

function cleanForaneData(data) {
    const cleaned = { ...data };
    const dateFields = ['inserted_date', 'updated_date'];
    dateFields.forEach(field => {
        if (cleaned[field] && cleaned[field] !== '0000-00-00 00:00:00' && cleaned[field] !== '') {
            cleaned[field] = new Date(cleaned[field]);
        } else {
            cleaned[field] = null;
        }
    });
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === '0000-00-00 00:00:00') {
            cleaned[key] = null;
        }
    });
    return cleaned;
}

// ==================== PRIEST OTHERS ====================
// Get all priest others
router.get('/priest-others', async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } },
                    { mobile: { $regex: search, $options: 'i' } },
                ],
            };
        }

        const [priestOthers, total] = await Promise.all([
            PriestOthers.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ name: 1 }),
            PriestOthers.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: total,
            data: priestOthers,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching priest others:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest others'
        });
    }
});

// Get single priest other by ID
router.get('/priest-others/:id', async (req, res) => {
    try {
        const priestOther = await PriestOthers.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!priestOther) {
            return res.status(404).json({
                success: false,
                message: 'Priest other not found'
            });
        }

        res.json({
            success: true,
            data: priestOther
        });
    } catch (error) {
        console.error('Error fetching priest other:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest other'
        });
    }
});

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
                const cleanedData = cleanPriestOtherData(priestOtherData);
                const existingPriestOther = await PriestOthers.findOne({
                    $or: [
                        { id: cleanedData.id },
                        { mobile: cleanedData.mobile },
                        { name: cleanedData.name, designation: cleanedData.designation }
                    ]
                });

                if (existingPriestOther) {
                    await PriestOthers.findByIdAndUpdate(existingPriestOther._id, cleanedData);
                    updatedCount++;
                } else {
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

function cleanPriestOtherData(data) {
    const cleaned = { ...data };
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
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === '0000-00-00') {
            cleaned[key] = null;
        }
    });
    return cleaned;
}

// ==================== PRIESTS ====================
// Get all priests
// ==================== PRIESTS (ACTIVE ONLY – NO LIMIT) ====================
router.get('/priests', async (req, res) => {
    try {
        const { search } = req.query;

        // ✅ Base filter → ONLY ACTIVE PRIESTS
        let filter = {
            expired: "Active"
        };

        // ✅ Search filter (optional)
        if (search && search.trim() !== '') {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } },
                { current_place: { $regex: search, $options: 'i' } },
                { present_address: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
            ];
        }

        // ✅ NO limit, NO skip, NO sort → DATABASE ORDER
        const priests = await Priest.find(filter);

        res.json({
            success: true,
            count: priests.length,
            data: priests
        });

    } catch (error) {
        console.error('❌ Error fetching priests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priests'
        });
    }
});


// Get single priest by ID
// ==================== PRIEST DETAIL ====================
router.get('/priests/:id', async (req, res) => {
    try {
        const priest = await Priest.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        }).lean();

        if (!priest) {
            return res.status(404).json({
                success: false,
                message: 'Priest not found'
            });
        }

        const serviceHistory = await PriestHistory.find({
            priest_id: priest.id || priest._id.toString()
        }).sort({ start_date: -1 });

        res.json({
            success: true,
            data: {
                ...priest,
                serviceHistory
            }
        });

    } catch (error) {
        console.error('❌ Error fetching priest:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest'
        });
    }
});

// ==================== PRIEST DETAIL (WITH SERVICE HISTORY) ====================
// router.get('/priests/:id', async (req, res) => {
//     try {
//         const priest = await Priest.findOne({
//             $or: [
//                 { _id: req.params.id },
//                 { id: req.params.id }
//             ]
//         }).lean();

//         if (!priest) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Priest not found'
//             });
//         }

//         // 🔥 Fetch service history
//         const serviceHistory = await PriestHistory.find({
//             priest_id: priest.id || priest._id.toString()
//         })
//             .sort({ start_date: -1 })
//             .lean();

//         res.json({
//             success: true,
//             data: {
//                 ...priest,
//                 serviceHistory
//             }
//         });

//     } catch (error) {
//         console.error('Error fetching priest detail:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error while fetching priest detail'
//         });
//     }
// });

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
                const cleanedData = cleanPriestData(priestData);

                // ✅ USE ID AS PRIMARY KEY (IMPORTANT)
                const existingPriest = await Priest.findOne({
                    id: cleanedData.id
                });

                if (existingPriest) {
                    await Priest.updateOne(
                        { _id: existingPriest._id },
                        { $set: cleanedData }
                    );
                    updatedCount++;
                } else {
                    await Priest.create(cleanedData);
                    importedCount++;
                }

            } catch (error) {
                console.error(
                    `❌ Error processing priest ID ${priestData.id}:`,
                    error.message
                );

                errors.push({
                    id: priestData.id,
                    name: priestData.name,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            imported: importedCount,
            updated: updatedCount,
            errorCount: errors.length,
            errorSamples: errors.slice(0, 5)
        });

    } catch (error) {
        console.error('❌ Priest import failed:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during priest import'
        });
    }
});


function cleanPriestData(data) {
    const cleaned = { ...data };

    // ==========================
    // SAFE DATE HANDLING
    // ==========================
    const dateFields = [
        'baptism_date',
        'dob',
        'join_seminary',
        'ordination_date',
        'profession_date',
        'death_date'
    ];

    dateFields.forEach(field => {
        if (
            cleaned[field] &&
            cleaned[field] !== '0000-00-00' &&
            cleaned[field] !== '' &&
            cleaned[field] !== null
        ) {
            const d = new Date(cleaned[field]);
            cleaned[field] = isNaN(d.getTime()) ? null : d;
        } else {
            cleaned[field] = null;
        }
    });

    // ==========================
    // FIELD MAPPINGS (IMPORTANT)
    // ==========================
    cleaned.expired = cleaned.expired_status || null;
    cleaned.education = cleaned.education_names || null;

    cleaned.web_priest_status_id =
        cleaned.priest_status || null;

    cleaned.web_priest_sub_status_id =
        cleaned.sub_status_names || null;

    cleaned.web_priest_secondary_sub_status_id =
        cleaned.secondary_sub_status_names || null;

    // ==========================
    // REMOVE UNWANTED FIELDS
    // ==========================
    delete cleaned.expired_status;
    delete cleaned.education_names;
    delete cleaned.priest_status;
    delete cleaned.sub_status_names;
    delete cleaned.secondary_sub_status_names;

    return cleaned;
}


// ==================== PARISHES ====================
// Get all parishes
router.get('/parishes', async (req, res) => {
    try {
        const { search } = req.query;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { vicar_name: { $regex: search, $options: 'i' } },
                    { place: { $regex: search, $options: 'i' } },
                    { address: { $regex: search, $options: 'i' } },
                    { forane_name: { $regex: search, $options: 'i' } },
                ],
            };
        }

        const parishes = await Parish.find(filter)
            .sort({ name: 1 });

        res.json({
            success: true,
            count: parishes.length,
            data: parishes
        });

    } catch (error) {
        console.error('Error fetching parishes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching parishes',
        });
    }
});


// Get single parish by ID
router.get('/parishes/:id', async (req, res) => {
    try {
        const parish = await Parish.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!parish) {
            return res.status(404).json({
                success: false,
                message: 'Parish not found'
            });
        }

        res.json({
            success: true,
            data: parish
        });
    } catch (error) {
        console.error('Error fetching parish:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching parish'
        });
    }
});

router.post('/parishes', async (req, res) => {
    try {
        const parishes = req.body;

        if (!Array.isArray(parishes)) {
            return res.status(400).json({
                success: false,
                message: 'Expected array of parishes'
            });
        }

        let inserted = 0;
        let updated = 0;
        let errors = [];

        for (const p of parishes) {
            try {
                const {
                    id,
                    archival_code,
                    name,
                    place,
                    patron_name,
                    parish_type,
                    shrine,
                    forane_name,
                    parish_coordinators,
                    address,
                    phone,
                    mobile,
                    whatsapp_number,
                    pan_card_num,
                    grade,
                    email,
                    website,
                    status,
                    vicar_name,
                    asst_vicar_names,
                    resident_vicar_names,

                    // 🔥 everything else
                    ...extra_data
                } = p;

                const payload = {
                    id,
                    archival_code,
                    name,
                    place,
                    patron_name,
                    parish_type,
                    shrine,
                    forane_name,
                    parish_coordinators,
                    address,
                    phone,
                    mobile,
                    whatsapp_number,
                    pan_card_num,
                    grade,
                    email,
                    website,
                    status,
                    vicar_name,
                    asst_vicar_names,
                    resident_vicar_names,

                    // ✅ proper type conversion
                    area: Number(p.area) || 0,
                    no_family_units: Number(p.no_family_units) || 0,
                    no_families: Number(p.no_families) || 0,
                    total_population: Number(p.total_population) || 0,
                    latitude: Number(p.latitude) || null,
                    longitude: Number(p.longitude) || null,
                    estb_date: p.estb_date ? new Date(`${p.estb_date}-01-01`) : null,

                    extra_data
                };

                const existing = await Parish.findOne({
                    $or: [{ id }, { archival_code }]
                });

                if (existing) {
                    await Parish.updateOne(
                        { _id: existing._id },
                        { $set: payload }
                    );
                    updated++;
                } else {
                    await Parish.create(payload);
                    inserted++;
                }

            } catch (err) {
                errors.push({
                    id: p.id,
                    name: p.name,
                    error: err.message
                });
            }
        }

        res.json({
            success: true,
            received: parishes.length,
            inserted,
            updated,
            errors: errors.length,
            error_samples: errors.slice(0, 5)
        });

    } catch (error) {
        console.error('❌ Parish import failed:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during parish import'
        });
    }
});


// ==================== PRIEST STATUS ====================
// Get all priest statuses
router.get('/priest-status', async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { pstatus: { $regex: search, $options: 'i' } },
                    { id: { $regex: search, $options: 'i' } },
                ],
            };
        }

        const [statuses, total] = await Promise.all([
            PriestStatus.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ display_order: 1, pstatus: 1 }),
            PriestStatus.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: total,
            data: statuses,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching priest statuses:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest statuses'
        });
    }
});

// Get single priest status by ID
router.get('/priest-status/:id', async (req, res) => {
    try {
        const status = await PriestStatus.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!status) {
            return res.status(404).json({
                success: false,
                message: 'Priest status not found'
            });
        }

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error fetching priest status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest status'
        });
    }
});

router.post('/priest-status', async (req, res) => {
    try {
        const statusData = req.body;

        if (!Array.isArray(statusData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const item of statusData) {
            try {
                const cleanedData = cleanStatusData(item);
                const existingStatus = await PriestStatus.findOne({
                    $or: [
                        { id: cleanedData.id },
                        { pstatus: cleanedData.pstatus }
                    ]
                });

                if (existingStatus) {
                    await PriestStatus.findByIdAndUpdate(existingStatus._id, cleanedData);
                    updatedCount++;
                } else {
                    await PriestStatus.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing status ${item.id || 'unknown'}:`, error);
                errors.push({
                    id: item.id || 'unknown',
                    pstatus: item.pstatus || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new status records and updated ${updatedCount} existing ones successfully. ${errors.length} errors occurred.`,
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

function cleanStatusData(data) {
    const cleaned = { ...data };
    if (cleaned.display_order) {
        cleaned.display_order = parseInt(cleaned.display_order) || 0;
    } else {
        cleaned.display_order = 0;
    }
    if (cleaned.updated_date && cleaned.updated_date !== '0000-00-00 00:00:00' && cleaned.updated_date !== '') {
        cleaned.updated_date = new Date(cleaned.updated_date);
    } else {
        cleaned.updated_date = null;
    }
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === '0000-00-00 00:00:00') {
            cleaned[key] = null;
        }
    });
    return cleaned;
}

// ==================== PRIEST SUB STATUS ====================
// Get all priest sub statuses
router.get('/priest-sub-status', async (req, res) => {
    try {
        const { search, main_status_id, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter.status = { $regex: search, $options: 'i' };
        }
        if (main_status_id) {
            filter.main_status_id = main_status_id;
        }

        const [subStatuses, total] = await Promise.all([
            PriestSubStatus.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ display_order: 1, status: 1 }),
            PriestSubStatus.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: total,
            data: subStatuses,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching priest sub statuses:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest sub statuses'
        });
    }
});

// Get single priest sub status by ID
router.get('/priest-sub-status/:id', async (req, res) => {
    try {
        const subStatus = await PriestSubStatus.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!subStatus) {
            return res.status(404).json({
                success: false,
                message: 'Priest sub status not found'
            });
        }

        res.json({
            success: true,
            data: subStatus
        });
    } catch (error) {
        console.error('Error fetching priest sub status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest sub status'
        });
    }
});

router.post('/priest-sub-status', async (req, res) => {
    try {
        const substatusData = req.body;

        if (!Array.isArray(substatusData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const item of substatusData) {
            try {
                const cleanedData = cleanSubStatusData(item);
                const existingSubStatus = await PriestSubStatus.findOne({
                    $or: [
                        { id: cleanedData.id },
                        {
                            main_status_id: cleanedData.main_status_id,
                            status: cleanedData.status
                        }
                    ]
                });

                if (existingSubStatus) {
                    await PriestSubStatus.findByIdAndUpdate(existingSubStatus._id, cleanedData);
                    updatedCount++;
                } else {
                    await PriestSubStatus.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing substatus ${item.id || 'unknown'}:`, error);
                errors.push({
                    id: item.id || 'unknown',
                    status: item.status || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new substatus records and updated ${updatedCount} existing ones successfully. ${errors.length} errors occurred.`,
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

function cleanSubStatusData(data) {
    const cleaned = { ...data };
    if (cleaned.display_order) {
        cleaned.display_order = parseInt(cleaned.display_order) || 0;
    } else {
        cleaned.display_order = 0;
    }
    if (cleaned.updated_date && cleaned.updated_date !== '0000-00-00 00:00:00' && cleaned.updated_date !== '') {
        cleaned.updated_date = new Date(cleaned.updated_date);
    } else {
        cleaned.updated_date = null;
    }
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === '0000-00-00 00:00:00') {
            cleaned[key] = null;
        }
    });
    return cleaned;
}

// ==================== PRIEST SECONDARY SUB STATUS ====================
// Get all priest secondary sub statuses
router.get('/priest-secondary-sub-status', async (req, res) => {
    try {
        const { search, main_status_id, secondary_status_id, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter.status = { $regex: search, $options: 'i' };
        }
        if (main_status_id) {
            filter.main_status_id = main_status_id;
        }
        if (secondary_status_id) {
            filter.secondary_status_id = secondary_status_id;
        }

        const [secondarySubStatuses, total] = await Promise.all([
            PriestSecondarySubStatus.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ display_order: 1, status: 1 }),
            PriestSecondarySubStatus.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: total,
            data: secondarySubStatuses,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching priest secondary sub statuses:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest secondary sub statuses'
        });
    }
});

// Get single priest secondary sub status by ID
router.get('/priest-secondary-sub-status/:id', async (req, res) => {
    try {
        const secondarySubStatus = await PriestSecondarySubStatus.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!secondarySubStatus) {
            return res.status(404).json({
                success: false,
                message: 'Priest secondary sub status not found'
            });
        }

        res.json({
            success: true,
            data: secondarySubStatus
        });
    } catch (error) {
        console.error('Error fetching priest secondary sub status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest secondary sub status'
        });
    }
});

router.post('/priest-secondary-sub-status', async (req, res) => {
    try {
        const secondarySubStatusData = req.body;

        if (!Array.isArray(secondarySubStatusData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const item of secondarySubStatusData) {
            try {
                const cleanedData = cleanSecondarySubStatusData(item);
                const existingSecondarySubStatus = await PriestSecondarySubStatus.findOne({
                    $or: [
                        { id: cleanedData.id },
                        {
                            main_status_id: cleanedData.main_status_id,
                            secondary_status_id: cleanedData.secondary_status_id,
                            status: cleanedData.status
                        }
                    ]
                });

                if (existingSecondarySubStatus) {
                    await PriestSecondarySubStatus.findByIdAndUpdate(existingSecondarySubStatus._id, cleanedData);
                    updatedCount++;
                } else {
                    await PriestSecondarySubStatus.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing secondary sub status ${item.id || 'unknown'}:`, error);
                errors.push({
                    id: item.id || 'unknown',
                    status: item.status || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new secondary sub status records and updated ${updatedCount} existing ones successfully. ${errors.length} errors occurred.`,
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

function cleanSecondarySubStatusData(data) {
    const cleaned = { ...data };
    if (cleaned.display_order) {
        cleaned.display_order = parseInt(cleaned.display_order) || 0;
    } else {
        cleaned.display_order = 0;
    }
    if (cleaned.updated_date && cleaned.updated_date !== '0000-00-00 00:00:00' && cleaned.updated_date !== '') {
        cleaned.updated_date = new Date(cleaned.updated_date);
    } else {
        cleaned.updated_date = null;
    }
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === '0000-00-00 00:00:00') {
            cleaned[key] = null;
        }
    });
    return cleaned;
}

// ==================== PRIEST HISTORIES ====================
// Get all priest histories
router.get('/priest-histories', async (req, res) => {
    try {
        const { search, priest_id, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { priest_id: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } },
                    { category_type: { $regex: search, $options: 'i' } },
                    { category_id: { $regex: search, $options: 'i' } },
                ],
            };
        }
        if (priest_id) {
            filter.priest_id = priest_id;
        }

        const [histories, total] = await Promise.all([
            PriestHistory.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ start_date: -1 }),
            PriestHistory.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: total,
            data: histories,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching priest histories:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest histories'
        });
    }
});

// Get single priest history by ID
router.get('/priest-histories/:id', async (req, res) => {
    try {
        const history = await PriestHistory.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!history) {
            return res.status(404).json({
                success: false,
                message: 'Priest history not found'
            });
        }

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching priest history:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest history'
        });
    }
});

// Get histories for specific priest
router.get('/priest-histories/priest/:priest_id', async (req, res) => {
    try {
        const histories = await PriestHistory.find({
            priest_id: req.params.priest_id
        }).sort({ start_date: -1 });

        res.json({
            success: true,
            count: histories.length,
            data: histories
        });
    } catch (error) {
        console.error('Error fetching priest histories:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest histories'
        });
    }
});

router.post('/priest-histories', async (req, res) => {
    try {
        const historyData = req.body;

        if (!Array.isArray(historyData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const item of historyData) {
            try {
                const cleanedData = cleanHistoryData(item);
                const existingHistory = await PriestHistory.findOne({
                    $or: [
                        { id: cleanedData.id },
                        {
                            priest_id: cleanedData.priest_id,
                            start_date: cleanedData.start_date,
                            designation: cleanedData.designation,
                            category_id: cleanedData.category_id
                        }
                    ]
                });

                if (existingHistory) {
                    await PriestHistory.findByIdAndUpdate(existingHistory._id, cleanedData);
                    updatedCount++;
                } else {
                    await PriestHistory.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing history ${item.id || 'unknown'}:`, error);
                errors.push({
                    id: item.id || 'unknown',
                    priest_id: item.priest_id || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new history records and updated ${updatedCount} existing ones successfully. ${errors.length} errors occurred.`,
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

function cleanHistoryData(data) {
    const cleaned = { ...data };
    const dateFields = ['start_date', 'end_date', 'updated_date'];
    dateFields.forEach(field => {
        if (cleaned[field] && cleaned[field] !== '0000-00-00' && cleaned[field] !== '' && cleaned[field] !== '0000-00-00 00:00:00') {
            cleaned[field] = new Date(cleaned[field]);
        } else {
            cleaned[field] = null;
        }
    });
    if (cleaned.start_date && cleaned.end_date && !isNaN(cleaned.start_date.getTime()) && !isNaN(cleaned.end_date.getTime())) {
        const diffTime = Math.abs(cleaned.end_date - cleaned.start_date);
        cleaned.duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
        cleaned.duration_days = null;
    }
    const today = new Date();
    cleaned.is_current = !cleaned.end_date || cleaned.end_date > today;
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === '0000-00-00' || cleaned[key] === '0000-00-00 00:00:00') {
            cleaned[key] = null;
        }
    });
    return cleaned;
}

// ==================== PRIEST EDUCATIONS ====================
// Get all priest educations
router.get('/priest-educations', async (req, res) => {
    try {
        const { search, web_priest_id, education_type, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { web_priest_id: { $regex: search, $options: 'i' } },
                    { course_type: { $regex: search, $options: 'i' } },
                    { institution: { $regex: search, $options: 'i' } },
                    { course: { $regex: search, $options: 'i' } },
                ],
            };
        }
        if (web_priest_id) {
            filter.web_priest_id = web_priest_id;
        }
        if (education_type) {
            filter.education_type = education_type;
        }

        const [educations, total] = await Promise.all([
            PriestEducation.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ start_date: 1 }),
            PriestEducation.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: total,
            data: educations,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching priest educations:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest educations'
        });
    }
});

// Get single priest education by ID
router.get('/priest-educations/:id', async (req, res) => {
    try {
        const education = await PriestEducation.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!education) {
            return res.status(404).json({
                success: false,
                message: 'Priest education not found'
            });
        }

        res.json({
            success: true,
            data: education
        });
    } catch (error) {
        console.error('Error fetching priest education:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest education'
        });
    }
});

// Get educations for specific priest
router.get('/priest-educations/priest/:web_priest_id', async (req, res) => {
    try {
        const educations = await PriestEducation.find({
            web_priest_id: req.params.web_priest_id
        }).sort({ start_date: 1 });

        res.json({
            success: true,
            count: educations.length,
            data: educations
        });
    } catch (error) {
        console.error('Error fetching priest educations:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest educations'
        });
    }
});

router.post('/priest-educations', async (req, res) => {
    try {
        const educationData = req.body;

        if (!Array.isArray(educationData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const item of educationData) {
            try {
                const cleanedData = cleanEducationData(item);
                const existingEducation = await PriestEducation.findOne({
                    $or: [
                        { id: cleanedData.id },
                        {
                            web_priest_id: cleanedData.web_priest_id,
                            course_type: cleanedData.course_type,
                            course: cleanedData.course,
                            institution: cleanedData.institution,
                            start_date: cleanedData.start_date
                        }
                    ]
                });

                if (existingEducation) {
                    await PriestEducation.findByIdAndUpdate(existingEducation._id, cleanedData);
                    updatedCount++;
                } else {
                    await PriestEducation.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing education ${item.id || 'unknown'}:`, error);
                errors.push({
                    id: item.id || 'unknown',
                    web_priest_id: item.web_priest_id || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new education records and updated ${updatedCount} existing ones. ${errors.length} errors occurred.`,
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

function cleanEducationData(data) {
    const cleaned = { ...data };
    const dateFields = ['start_date', 'end_date', 'updated_date'];
    dateFields.forEach(field => {
        if (cleaned[field] && cleaned[field] !== '0000-00-00' && cleaned[field] !== '' && cleaned[field] !== '0000-00-00 00:00:00') {
            cleaned[field] = new Date(cleaned[field]);
        } else {
            cleaned[field] = null;
        }
    });
    if (cleaned.start_date && cleaned.end_date && !isNaN(cleaned.start_date.getTime()) && !isNaN(cleaned.end_date.getTime())) {
        const years = (cleaned.end_date.getFullYear() - cleaned.start_date.getFullYear()) +
            (cleaned.end_date.getMonth() - cleaned.start_date.getMonth()) / 12;
        cleaned.duration_years = parseFloat(years.toFixed(1));
    } else {
        cleaned.duration_years = null;
    }
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === '0000-00-00' || cleaned[key] === '0000-00-00 00:00:00') {
            cleaned[key] = null;
        }
    });
    return cleaned;
}

// ==================== PRIEST DESIGNATIONS ====================
// Get all priest designations
router.get('/priest-designations', async (req, res) => {
    try {
        const { search, status, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (status) {
            filter.status = status;
        }

        const [designations, total] = await Promise.all([
            PriestDesignation.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ sort_order: 1, name: 1 }),
            PriestDesignation.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: total,
            data: designations,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching priest designations:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest designations'
        });
    }
});

// Get single priest designation by ID
router.get('/priest-designations/:id', async (req, res) => {
    try {
        const designation = await PriestDesignation.findOne({
            $or: [
                { _id: req.params.id },
                { id: req.params.id }
            ]
        });

        if (!designation) {
            return res.status(404).json({
                success: false,
                message: 'Priest designation not found'
            });
        }

        res.json({
            success: true,
            data: designation
        });
    } catch (error) {
        console.error('Error fetching priest designation:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching priest designation'
        });
    }
});

router.post('/priest-designations', async (req, res) => {
    try {
        const designationData = req.body;

        if (!Array.isArray(designationData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array.'
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const item of designationData) {
            try {
                const cleanedData = cleanDesignationData(item);
                const existingDesignation = await PriestDesignation.findOne({
                    $or: [
                        { id: cleanedData.id },
                        { name: cleanedData.name }
                    ]
                });

                if (existingDesignation) {
                    await PriestDesignation.findByIdAndUpdate(existingDesignation._id, cleanedData);
                    updatedCount++;
                } else {
                    await PriestDesignation.create(cleanedData);
                    importedCount++;
                }
            } catch (error) {
                console.error(`Error processing designation ${item.id || 'unknown'}:`, error);
                errors.push({
                    id: item.id || 'unknown',
                    name: item.name || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} new designations and updated ${updatedCount} existing ones. ${errors.length} errors occurred.`,
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

function cleanDesignationData(data) {
    const cleaned = { ...data };
    if (cleaned.sort_order) {
        cleaned.sort_order = parseInt(cleaned.sort_order) || 0;
    } else {
        cleaned.sort_order = 0;
    }
    if (cleaned.updated_date && cleaned.updated_date !== '0000-00-00 00:00:00' && cleaned.updated_date !== '') {
        cleaned.updated_date = new Date(cleaned.updated_date);
    } else {
        cleaned.updated_date = null;
    }
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === '0000-00-00 00:00:00') {
            cleaned[key] = null;
        }
    });
    return cleaned;
}

// ==================== SPECIAL ENDPOINTS ====================
// Get obituary priests
router.get('/priests/obituary', async (req, res) => {
    try {
        const { filter } = req.query;
        const year = 2020;

        let query = { death_date: { $ne: null } };

        if (filter === "before") {
            query = {
                death_date: { $ne: null },
                $expr: { $lt: [{ $toDate: "$death_date" }, new Date(`${year}-01-01`)] }
            };
        } else if (filter === "after") {
            query = {
                death_date: { $ne: null },
                $expr: { $gte: [{ $toDate: "$death_date" }, new Date(`${year}-01-01`)] }
            };
        }

        const priests = await Priest.find(query).sort({ death_date: -1 }).lean();

        res.json({
            success: true,
            count: priests.length,
            data: priests
        });
    } catch (error) {
        console.error("❌ Error fetching obituary:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching obituary"
        });
    }
});

// ==================== DATABASE SUMMARY ====================
// Get database summary (counts for all tables)
router.get('/summary', async (req, res) => {
    try {
        const models = {
            parishes: Parish,
            priests: Priest,
            'priest-others': PriestOthers,
            administration: Administration,
            institutions: Institution,
            foranes: Forane,
            'priest-status': PriestStatus,
            'priest-sub-status': PriestSubStatus,
            'priest-secondary-sub-status': PriestSecondarySubStatus,
            'priest-histories': PriestHistory,
            'priest-educations': PriestEducation,
            'priest-designations': PriestDesignation
        };

        const summary = {};
        for (const [key, model] of Object.entries(models)) {
            try {
                const count = await model.countDocuments();
                summary[key] = count;
            } catch (error) {
                summary[key] = 0;
            }
        }

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            summary: summary,
            totalTables: Object.keys(summary).length,
            totalRecords: Object.values(summary).reduce((a, b) => a + b, 0)
        });
    } catch (error) {
        console.error('Error fetching database summary:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching database summary'
        });
    }
});

export default router;