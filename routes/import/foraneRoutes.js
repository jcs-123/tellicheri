import express from 'express';
import Forane from '../../models/Forane.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const foranes = await Forane.find({})
      .sort({ name: 1 })
      .select('-__v -createdAt -updatedAt'); // Exclude unnecessary fields

    res.json({
      success: true,
      count: foranes.length,
      data: foranes
    });
  } catch (error) {
    console.error('Error fetching foranes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching foranes',
      error: error.message
    });
  }
});

// Get single forane by ID
router.get('/:id', async (req, res) => {
  try {
    const forane = await Forane.findById(req.params.id);
    
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

// Search foranes
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const foranes = await Forane.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { place: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).sort({ name: 1 });

    res.json({
      success: true,
      count: foranes.length,
      data: foranes
    });
  } catch (error) {
    console.error('Error searching foranes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching foranes'
    });
  }
});


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