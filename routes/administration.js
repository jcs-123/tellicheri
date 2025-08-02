// backend/routes/administration.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { Administration } from '../models/importModels.js';

const router = express.Router();

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/admin/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// GET all administration records
router.get('/', async (req, res) => {
  try {
    const records = await Administration.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST image upload and update admin document
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.body;

    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const imageUrl = `/uploads/admin/${req.file.filename}`;

    const updatedDoc = await Administration.findByIdAndUpdate(
      id,
      { imageUrl }, // Add or update the imageUrl field dynamically
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: 'Admin document not found' });
    }

    res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default router;
