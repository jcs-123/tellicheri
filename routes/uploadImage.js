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


// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { Administration } from '../models/importModels.js';

// const router = express.Router();

// // Ensure uploads folder exists
// const uploadDir = './uploads';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // Set up multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const filename = Date.now() + '-' + file.originalname.replace(/\s+/g, '');
//     cb(null, filename);
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter(req, file, cb) {
//     if (!file.mimetype.startsWith('image/')) {
//       return cb(new Error('Only image files are allowed!'));
//     }
//     cb(null, true);
//   },
// });

// // @route   POST /api/upload-image
// // @desc    Upload image and update Administration collection
// router.post('/', upload.single('image'), async (req, res) => {
//   try {
//     const { id } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

//     await Administration.updateOne(
//       { _id: id },
//       { $set: { imageUrl } }
//     );

//     res.status(200).json({
//       message: 'Image uploaded and updated successfully',
//       imageUrl,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;
