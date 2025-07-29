const express = require('express');
const router = express.Router();
const uploadDownloads = require('../middleware/uploadDownloads');
const Download = require('../models/Download');
const fs = require('fs');
const path = require('path');

// POST - Upload new file
router.post('/', uploadDownloads.single('file'), async (req, res) => {
  try {
    const { title, category, displayOrder, isActive } = req.body;
    const fileUrl = req.file ? `/uploads/downloads/${req.file.filename}` : null;

    if (!fileUrl) return res.status(400).json({ error: 'File upload failed' });

    const newDownload = new Download({
      title,
      category,
      fileUrl,
      displayOrder,
      isActive: isActive === 'true' || isActive === true,
    });

    await newDownload.save();
    res.status(201).json({ message: 'Download added', download: newDownload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET - Active downloads only (for frontend)
router.get('/', async (req, res) => {
  try {
    const downloads = await Download.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(downloads);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - All downloads (for admin)
router.get('/all', async (req, res) => {
  try {
    const downloads = await Download.find().sort({ createdAt: -1 });
    res.json(downloads);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT - Update a download
router.put('/:id', uploadDownloads.single('file'), async (req, res) => {
  try {
    const { title, category, isActive } = req.body;
    let updateData = { title, category, isActive: isActive === 'true' || isActive === true };

    // If new file is uploaded
    if (req.file) {
      const newFileUrl = `/uploads/downloads/${req.file.filename}`;
      
      // Delete old file if exists
      if (req.body.oldFileUrl) {
        const oldFilePath = path.join(__dirname, '../public', req.body.oldFileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      updateData.fileUrl = newFileUrl;
    }

    const updatedDownload = await Download.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedDownload) {
      return res.status(404).json({ message: 'Download not found' });
    }

    res.json(updatedDownload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - Download file by ID
router.get('/file/:id', async (req, res) => {
  try {
    const download = await Download.findById(req.params.id);
    if (!download || !download.fileUrl) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', download.fileUrl); // matches /uploads/...
    const filename = path.basename(filePath);

    if (fs.existsSync(filePath)) {
      res.download(filePath, filename); // triggers browser download
    } else {
      res.status(404).json({ message: 'File does not exist on server' });
    }
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;