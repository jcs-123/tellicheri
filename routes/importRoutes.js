import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  Parishes,
  PriestStatus,
  PriestSubStatus,
  PriestSecondarySubStatus,
  Priests,
  PriestHistories,
  PriestEducations,
  PriestOthers,
  Administration,
  Institutions,
  PriestDesignations,
} from '../models/importModels.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/imports';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Mapping table name to corresponding model
const modelMap = {
  Parishes,
  PriestStatus,
  PriestSubStatus,
  PriestSecondarySubStatus,
  Priests,
  PriestHistories,
  PriestEducations,
  PriestOthers,
  Administration,
  Institutions,
  PriestDesignations,
};

// POST /api/import/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const tableName = req.body.table;
    const filePath = req.file?.path;

    if (!modelMap[tableName]) {
      return res.status(400).json({ message: `Unknown table: ${tableName}` });
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ message: 'File not uploaded properly' });
    }

    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);

    if (!Array.isArray(jsonData)) {
      return res.status(400).json({ message: 'Invalid JSON: must be an array' });
    }

    const Model = modelMap[tableName];
    await Model.insertMany(jsonData);

    res.status(200).json({ message: `${jsonData.length} records inserted into ${tableName}` });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: 'Error inserting data', error: err.message });
  }
});

export default router;
