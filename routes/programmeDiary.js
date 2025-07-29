// backend/routes/programmeDiary.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/programme-diary';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, 'latest.pdf'); // ✅ always overwrite to latest.pdf
  }
});

const upload = multer({ storage });

// POST: Upload diary PDF
router.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  return res.status(200).json({
    success: true,
    message: 'Programme diary uploaded successfully',
    filename: req.file.filename,
    path: req.file.path,
  });
});

export default router;
