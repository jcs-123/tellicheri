import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  category: String,
  type: String,
  title: String,
  description: String,
  image: String,
  file: String,
  publishedDate: Date,
  validUpto: Date,
  displayOrder: Number,
  status: String,
});

export default mongoose.model('News', newsSchema);
