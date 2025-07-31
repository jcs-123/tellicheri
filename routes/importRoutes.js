const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Example model mapping
const models = {
  "Parishes": require('../models/Parish'),
  "Priests": require('../models/Priest'),
  "Administration": require('../models/Administration'),
  // Add other mappings here...
};

// Set up multer to parse JSON files
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  const { table } = req.body;
  const filePath = req.file.path;

  try {
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!models[table]) {
      return res.status(400).json({ error: 'Unknown table type' });
    }

    const result = await models[table].insertMany(jsonData);
    fs.unlinkSync(filePath); // cleanup
    res.status(200).json({ message: `Uploaded ${result.length} records to ${table}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

module.exports = router;
