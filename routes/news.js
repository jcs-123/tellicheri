import express from 'express';
import multer from 'multer';
import path from 'path';
import News from '../models/News.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// POST /api/news
router.post('/', upload.fields([{ name: 'image' }, { name: 'file' }]), async (req, res) => {
    try {
        const { category, type, title, description, publishedDate, validUpto, displayOrder, status } = req.body;
        const image = req.files?.image?.[0]?.filename || '';
        const file = req.files?.file?.[0]?.filename || '';

        const newNews = new News({ category, type, title, description, publishedDate, validUpto, displayOrder, status, image, file });
        await newNews.save();

        res.status(201).json({ message: 'News added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/news (all news)
router.get('/', async (req, res) => {
    try {
        const allNews = await News.find().sort({ publishedDate: -1 });
        res.json(allNews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch news' });
    }
});

// ✅ GET /api/flash-news – MUST be above `/:id`
router.get('/flash-news', async (req, res) => {
    try {
        const latestFlashNews = await News.findOne({ type: 'Flash', status: 'Published' })
            .sort({ publishedDate: -1 });

        if (!latestFlashNews) {
            return res.status(404).json({ message: 'No flash news found' });
        }

        res.json(latestFlashNews);
    } catch (error) {
        console.error('Error fetching flash news:', error);
        res.status(500).json({ message: 'Server error while fetching flash news' });
    }
});

// GET /api/news/:id
router.get('/:id', async (req, res) => {
    try {
        const newsItem = await News.findById(req.params.id);
        if (!newsItem) return res.status(404).json({ message: 'Not found' });
        res.json(newsItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// PUT /api/news/:id/publish - Publish a pending news item
router.put('/:id/publish', async (req, res) => {
    try {
        const { id } = req.params;

        const updatedNews = await News.findByIdAndUpdate(
            id,
            { status: 'Published' },
            { new: true }
        );

        if (!updatedNews) {
            return res.status(404).json({ message: 'News item not found' });
        }

        res.status(200).json({
            message: 'News item published successfully',
            news: updatedNews,
        });
    } catch (error) {
        console.error('❌ Error publishing news:', error);
        res.status(500).json({ message: 'Server error while publishing news' });
    }
});


export default router;
