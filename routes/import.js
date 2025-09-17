import express from 'express';
import Parish from '../models/Parish.js';
import Priest from '../models/Priest.js';
import PriestOthers from '../models/Priestothers.js'; // Import the new model

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
  
  // Convert date strings to Date objects
  const dateFields = [
    'baptism_date', 'dob', 'join_seminary', 'ordination_date',
    'profession_date', 'death_date'
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

export default router;