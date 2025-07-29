import express from 'express';
import Circular from '../models/Circular.js';
import upload from '../middleware/uploadCirculars.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ✅ GET - Fetch All Circulars
router.get('/', async (req, res) => {
  try {
    const circulars = await Circular.find().sort({ createdAt: -1 });
    res.json(circulars);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ POST - Add Circular
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, displayOrder, isActive } = req.body;
    const fileUrl = `/uploads/circulars/${req.file.filename}`;

    const newCircular = new Circular({
      title,
      fileUrl,
      displayOrder,
      isActive: isActive === 'true' || isActive === true
    });

    await newCircular.save();
    res.status(201).json({ message: 'Circular saved', circular: newCircular });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ PUT - Update Circular
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const { title, displayOrder, isActive } = req.body;
    const updateData = {
      title,
      displayOrder,
      isActive: isActive === 'true' || isActive === true
    };

    // If a new file was uploaded
    if (req.file) {
      // Delete old file if it exists
      const circular = await Circular.findById(req.params.id);
      if (circular.fileUrl) {
        const oldFilePath = path.join(__dirname, '../..', circular.fileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      updateData.fileUrl = `/uploads/circulars/${req.file.filename}`;
    }

    const updatedCircular = await Circular.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json({ message: 'Circular updated', circular: updatedCircular });
  } catch (err) {
    console.error('Update error:', err); // Add detailed logging
    res.status(500).json({ error: err.message }); // Send actual error message
  }
});

export default router;