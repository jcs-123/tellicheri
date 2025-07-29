import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import HomeVideo from '../models/HomeVideo.js';

const router = express.Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.join('uploads', 'homevideos');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `homevideo-${timestamp}${ext}`);
  }
});

// File filter to accept only MP4
const fileFilter = (req, file, cb) => {
  const isMp4 = file.mimetype === 'video/mp4';
  if (isMp4) cb(null, true);
  else cb(new Error('Only MP4 files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST: Upload Home Video
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Save to DB
    const newVideo = new HomeVideo({
      filename: req.file.filename,
      path: req.file.path,
    });

    await newVideo.save();

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        filename: newVideo.filename,
        url: `${req.protocol}://${req.get('host')}/${newVideo.path.replace(/\\/g, '/')}`
      }
    });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
});

// GET: Latest Home Video
router.get('/', async (req, res) => {
  try {
    const latestVideo = await HomeVideo.findOne().sort({ createdAt: -1 });

    if (!latestVideo) {
      return res.status(404).json({ success: false, message: 'No video found' });
    }

    const videoUrl = `${req.protocol}://${req.get('host')}/${latestVideo.path.replace(/\\/g, '/')}`;
    res.status(200).json({
      success: true,
      video: {
        filename: latestVideo.filename,
        url: videoUrl
      }
    });
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch video', error: err.message });
  }
});

export default router;
