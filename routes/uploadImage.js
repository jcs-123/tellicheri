import express from 'express';
import multer from 'multer';
import { Administration } from '../models/importModels.js';
import fs from 'fs';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() }); // Store image in memory

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Update document with base64 image
    await Administration.updateOne({ _id: id }, { $set: { imageUrl: base64Image } });

    res.status(200).json({
      message: 'Image uploaded and saved as base64',
      imageUrl: base64Image,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
