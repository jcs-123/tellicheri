const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// MongoDB Parish Schema
const parishSchema = new mongoose.Schema({
  id: String,
  archival_code: String,
  name: String,
  place: String,
  patron_name: String,
  parish_type: String,
  shrine: String,
  forane_name: String,
  parish_coordinators: String,
  address: String,
  phone: String,
  mobile: String,
  whatsapp_number: String,
  pan_card_num: String,
  grade: String,
  email: String,
  website: String,
  area: Number,
  no_family_units: Number,
  no_families: Number,
  total_population: Number,
  estb_date: Date,
  latitude: Number,
  longitude: Number,
  status: String,
  vicar_name: String,
  asst_vicar_names: String,
  resident_vicar_names: String
}, { timestamps: true });

const Parish = mongoose.model('Parish', parishSchema);

// Priest Status Schema
const priestStatusSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  status: String
}, { timestamps: true });

const PriestStatus = mongoose.model('PriestStatus', priestStatusSchema);

// Priest Schema
const priestSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  phone: String,
  status: String,
  designation: String,
  parish_id: String,
  // Add other priest fields as needed
}, { timestamps: true });

const Priest = mongoose.model('Priest', priestSchema);

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

// Import priests data
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
    let errors = [];
    
    for (const priest of priestsData) {
      try {
        const existingPriest = await Priest.findOne({ 
          $or: [{ id: priest.id }, { email: priest.email }] 
        });
        
        if (existingPriest) {
          await Priest.findByIdAndUpdate(existingPriest._id, priest);
        } else {
          await Priest.create(priest);
        }
        
        importedCount++;
      } catch (error) {
        console.error(`Error processing priest ${priest.id}:`, error);
        errors.push({ id: priest.id, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Imported ${importedCount} priests successfully. ${errors.length} errors occurred.`,
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

// Add more import endpoints for other tables as needed

module.exports = router;