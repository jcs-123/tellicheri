import express from 'express';
import Priest from '../../models/Priest.js';

const router = express.Router();

// GET all priests
router.get('/priests', async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } },
                    { current_place: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            };
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { name: 1 },
            select: '-__v -createdAt -updatedAt' // Exclude unnecessary fields
        };

        // Using mongoose-paginate-v2 or similar pagination
        const priests = await Priest.find(filter)
            .sort(options.sort)
            .select(options.select)
            .limit(options.limit * 1)
            .skip((options.page - 1) * options.limit);

        const total = await Priest.countDocuments(filter);

        res.json({
            success: true,
            count: priests.length,
            total,
            page: options.page,
            pages: Math.ceil(total / options.limit),
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

// GET priest by ID
router.get('/priests/:id', async (req, res) => {
    try {
        const priest = await Priest.findById(req.params.id);
        if (!priest) {
            return res.status(404).json({ 
                success: false, 
                message: 'Priest not found' 
            });
        }
        res.json({ 
            success: true, 
            data: priest 
        });
    } catch (error) {
        console.error('Error fetching priest details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching priest details' 
        });
    }
});

// GET obituary priests
router.get('/priests/obituary', async (req, res) => {
    try {
        const { filter, year = 2020 } = req.query;

        console.log("🔍 Fetching obituary with filter:", filter);

        let query = { death_date: { $ne: null, $exists: true } };

        if (filter === "before") {
            query.death_date = { 
                ...query.death_date,
                $lt: new Date(`${year}-01-01`)
            };
        } else if (filter === "after") {
            query.death_date = { 
                ...query.death_date,
                $gte: new Date(`${year}-01-01`)
            };
        }

        console.log("👉 Final Mongo Query:", JSON.stringify(query));

        const priests = await Priest.find(query)
            .sort({ death_date: -1 })
            .select('-__v -createdAt -updatedAt');

        console.log("✅ Priests found:", priests.length);
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

// POST import priests data
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
        'baptism_date', 'dob', 'join_seminary',
        'ordination_date', 'profession_date', 'death_date'
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

export default router;