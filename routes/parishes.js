// // backend/routes/parishes.js
// import express from 'express';
// import { Parishes } from '../models/importModels.js';

// const router = express.Router();

// router.get('/', async (req, res) => {
//   try {
//     const records = await Parishes.find();
//     res.json(records);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// export default router;
