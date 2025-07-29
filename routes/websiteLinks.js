import express from 'express';
import WebsiteLink from '../models/WebsiteLink.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 📁 File Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/pdfs';
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// 📝 POST: Add new website link or PDF
router.post('/', upload.single('pdfFile'), async (req, res) => {
  try {
    const { title, webLink, pageType } = req.body;
    let finalLink = webLink;

    if (req.file) {
      finalLink = `${req.protocol}://${req.get('host')}/uploads/pdfs/${req.file.filename}`;
    }

    const newLink = new WebsiteLink({
      title,
      webLink: finalLink,
      pageType,
    });

    await newLink.save();
    res.json({ success: true, message: 'Link added', data: newLink });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// GET: Fetch all website links
// GET: Fetch website links (with optional pageType filter)
router.get('/', async (req, res) => {
  try {
    const { pageType } = req.query;
    const query = pageType ? { pageType } : {};
    const links = await WebsiteLink.find(query).sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch links' });
  }
});


// PUT: Update a website link
router.put('/:id', async (req, res) => {
  try {
    const { title, webLink, pageType, status } = req.body;
    const updated = await WebsiteLink.findByIdAndUpdate(
      req.params.id,
      { title, webLink, pageType, status },
      { new: true }
    );
    res.json({ success: true, message: 'Updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// DELETE: Delete a website link
router.delete('/:id', async (req, res) => {
  try {
    await WebsiteLink.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

export default router;
