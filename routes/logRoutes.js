// routes/logRoutes.js
import express from 'express';
import UserLog from '../models/UserLog.js';

const router = express.Router();

// GET /api/logs?username=&operation=&fromDate=&toDate=
router.get('/', async (req, res) => {
  const { username, operation, fromDate, toDate } = req.query;
  let filter = {};

  if (username) filter.username = username;
  if (operation) filter.operation = operation;
  if (fromDate && toDate) {
    filter.createdAt = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate + 'T23:59:59'),
    };
  }

  try {
    const logs = await UserLog.find(filter).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

export default router;