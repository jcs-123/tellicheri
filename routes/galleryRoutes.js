import express from 'express';
import Gallery from '../models/Gallery.js';
import upload from '../middleware/uploadGallery.js';

const router = express.Router();

// POST - Add new gallery (Image or Video)
router.post(
  '/',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 20 }
  ]),
  async (req, res) => {
    try {
      const {
        category,
        type,
        title,
        description,
        location,
        eventDate,
        displayOrder,
        status,
        videoUrl
      } = req.body;

      const thumbnailUrl = req.files['thumbnail']
        ? `/uploads/gallery/${req.files['thumbnail'][0].filename}`
        : null;

      const imageUrls =
        type === 'Image' && req.files['images']
          ? req.files['images'].map(file => `/uploads/gallery/${file.filename}`)
          : [];

      const newGallery = new Gallery({
        category,
        type,
        title,
        description,
        location,
        thumbnailUrl,
        imageUrls,
        videoUrl: type === 'Video' ? videoUrl : '',
        eventDate,
        displayOrder,
        status
      });

      await newGallery.save();
      res.status(201).json({ message: 'Gallery added successfully', gallery: newGallery });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save gallery' });
    }
  }
);

// GET - Filter gallery with multiple parameters
router.get('/', async (req, res) => {
  try {
    const { type, status, category } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = { $regex: `^${status}$`, $options: 'i' };
    if (category) filter.category = { $regex: category, $options: 'i' };

    const galleries = await Gallery.find(filter).sort({ displayOrder: 1 });
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// GET - Single gallery by ID
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load gallery detail' });
  }
});

// PUT - Update gallery
router.put('/:id', async (req, res) => {
  try {
    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedGallery);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update gallery' });
  }
});

// PATCH - Update gallery status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updatedGallery);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update gallery status' });
  }
});

// POST - Add more images to an existing gallery
router.post('/:id/images', upload.array('images', 20), async (req, res) => {
  try {
    const imageUrls = req.files.map(file => `/uploads/gallery/${file.filename}`);
    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      { $push: { imageUrls: { $each: imageUrls } } },
      { new: true }
    );
    res.json(updatedGallery);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add images' });
  }
});

// DELETE - Remove a single image from gallery
router.delete('/:id/images', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      { $pull: { imageUrls: imageUrl } },
      { new: true }
    );
    res.json(updatedGallery);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove image' });
  }
});

export default router;
