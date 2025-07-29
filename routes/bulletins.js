import express from 'express';
import multer from 'multer';
import Bulletin from '../models/Bulletin.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/bulletins';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post(
    '/add',
    upload.fields([{ name: 'file' }, { name: 'coverImage' }]),
    async (req, res) => {
        try {
            const { title, year, month, displayOrder, status } = req.body;

            const file = req.files['file']?.[0];
            const coverImage = req.files['coverImage']?.[0];

            if (!file || !coverImage) {
                return res.status(400).json({ message: 'Files missing' });
            }

            const bulletin = new Bulletin({
                title,
                year,
                month,
                fileUrl: `/uploads/bulletins/${file.filename}`,
                coverImageUrl: `/uploads/bulletins/${coverImage.filename}`,
                displayOrder,
                status
            });

            await bulletin.save();
            res.status(201).json({ message: 'Bulletin uploaded successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);
router.get('/public', async (req, res) => {
    try {
        const bulletins = await Bulletin.find({ status: 'Published' }).sort({ year: -1, month: -1 });
        res.json(bulletins);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch bulletins' });
    }
});

router.get('/', async (req, res) => {
    try {
        const bulletins = await Bulletin.find().sort({ year: -1, month: -1 });
        res.json(bulletins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch bulletins' });
    }
});
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBulletin = await Bulletin.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedBulletin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bulletin = await Bulletin.findById(id);
    
    if (!bulletin) {
      return res.status(404).json({ message: 'Bulletin not found' });
    }
    
    // Delete associated files
    if (bulletin.fileUrl) {
      const filePath = path.join(process.cwd(), bulletin.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    if (bulletin.coverImageUrl) {
      const imagePath = path.join(process.cwd(), bulletin.coverImageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Bulletin.findByIdAndDelete(id);
    res.json({ message: 'Bulletin deleted successfully' });
  } catch (err) {
    console.error('Error deleting bulletin:', err);
    res.status(500).json({ 
      message: 'Failed to delete bulletin',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;
