import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Administration } from '../models/importModels.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadPath = 'uploads/admin';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// @route GET /api/administration
router.get('/', async (req, res) => {
  try {
    const records = await Administration.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/administration
// POST /api/upload-image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No image provided' });

    const imageUrl = `/uploads/admin/${req.file.filename}`;

    const updatedAdmin = await Administration.findByIdAndUpdate(
      id,
      { imageUrl },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Image uploaded', imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload error', error: err.message });
  }
});


export default router;
