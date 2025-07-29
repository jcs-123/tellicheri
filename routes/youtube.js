import express from 'express';
import YoutubeVideo from '../models/YoutubeVideo.js'; // ✅ Make sure this model file also exists

const router = express.Router();

// ✅ Save or update YouTube video key
router.post('/update', async (req, res) => {
  const { keyvalue } = req.body;
  try {
    let record = await YoutubeVideo.findOne();
    if (record) {
      record.keyvalue = keyvalue;
      await record.save();
    } else {
      record = await YoutubeVideo.create({ keyvalue });
    }
    res.json({ success: true, message: 'YouTube key updated successfully.', record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating key.', error: err.message });
  }
});

// ✅ Get the current YouTube video key
router.get('/', async (req, res) => {
  try {
    const record = await YoutubeVideo.findOne();
    if (!record) {
      return res.status(404).json({ success: false, message: 'No key found' });
    }
    res.json({ success: true, keyvalue: record.keyvalue });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving key.', error: err.message });
  }
});

export default router;
