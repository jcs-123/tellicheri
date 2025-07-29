import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  category: String,
  type: { type: String, enum: ['Image', 'Video'], required: true },
  title: String,
  description: String,
  location: String,
  thumbnailUrl: String,
  imageUrls: [String],      // For image galleries
  videoUrl: String,         // For video galleries
  eventDate: Date,
  displayOrder: Number,
  status: { type: String, enum: ['Published', 'Pending'], default: 'Published' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Gallery', gallerySchema);
