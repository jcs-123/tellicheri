import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { Administration } from '../models/importModels.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'admin_images', // Folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

// @route POST /api/upload-image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.body;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded or invalid file' });
    }

    const imageUrl = req.file.path;

    await Administration.updateOne({ _id: id }, { $set: { imageUrl } });

    res.status(200).json({
      message: 'Image uploaded and updated successfully',
      imageUrl,
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
