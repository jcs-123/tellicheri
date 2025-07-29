import mongoose from 'mongoose';

const bulletinSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: String, required: true },
  month: { type: String, required: true },
  fileUrl: { type: String, required: true },
  coverImageUrl: { type: String, required: true },
  displayOrder: { type: String },
  status: { type: String, enum: ['Published', 'Pending'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Bulletin', bulletinSchema);
