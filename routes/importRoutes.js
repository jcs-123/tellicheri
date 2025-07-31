import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  Parishes, PriestStatus, PriestSubStatus, PriestSecondarySubStatus,
  Priests, PriestHistories, PriestEducations, PriestOthers,
  Administration, Institutions, PriestDesignations
} from '../models/importModels.js'; // You’ll define these

const router = express.Router();

// Multer config for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/imports';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Table mapping
const modelMap = {
  'Parishes': Parishes,
  'Priest Status': PriestStatus,
  'Priest Sub Status': PriestSubStatus,
  'Priest Secondary Sub Status': PriestSecondarySubStatus,
  'Priests': Priests,
  'Priest Histories': PriestHistories,
  'Priest Educations': PriestEducations,
  'Priest Others': PriestOthers,
  'Administration': Administration,
  'Institutions': Institutions,
  'Priest Designations': PriestDesignations
};

// Upload route
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const table = req.body.table;
    const filePath = req.file.path;

    if (!modelMap[table]) {
      return res.status(400).json({ message: `Unknown table: ${table}` });
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath));
    if (!Array.isArray(jsonData)) {
      return res.status(400).json({ message: 'Uploaded file must be a JSON array' });
    }

    const Model = modelMap[table];
    await Model.insertMany(jsonData);

    res.status(200).json({ message: `Data imported into ${table}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
router.get('/all-data', async (req, res) => {
  try {
    const allData = {};

    for (const [table, Model] of Object.entries(modelMap)) {
      allData[table] = await Model.find({});
    }

    res.json(allData);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data', error: err.message });
  }
});


export default router;
