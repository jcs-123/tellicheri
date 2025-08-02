// backend/routes/administration.js
import express from 'express';
import { Administration } from '../models/importModels.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const records = await Administration.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
