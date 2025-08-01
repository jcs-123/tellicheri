import express from 'express';
import multer from 'multer';
import { Administration } from '../models/importModels.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/administration';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET all administration records
router.get('/', async (req, res) => {
  try {
    const records = await Administration.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload image for administration record
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Record ID is required' });
    }

    // Construct the image URL
    const imageUrl = `/uploads/administration/${req.file.filename}`;

    // Update the administration record with the new image URL
    const updatedRecord = await Administration.findByIdAndUpdate(
      id,
      { imageUrl: imageUrl },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      record: updatedRecord
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;