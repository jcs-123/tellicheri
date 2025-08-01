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
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, author, position, date } = req.body;
    const imageUrl = req.file ? `/uploads/admin/${req.file.filename}` : '';

    const newAdmin = new Administration({
      title,
      author,
      position,
      date,
      imageUrl,
    });

    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving data', error: err.message });
  }
});

export default router;
