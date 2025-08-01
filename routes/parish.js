// routes/parish.js
import express from 'express';
import { Parishes } from '../models/importModels.js';

const router = express.Router();

// Example: Get all parishes
router.get('/parishes', async (req, res) => {
  try {
    const parishes = await Parishes.find({});
    res.json(parishes);
  } catch (err) {
    console.error('Error fetching parishes:', err);
    res.status(500).json({ message: 'Error fetching parishes' });
  }
});

export default router;
