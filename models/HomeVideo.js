// models/HomeVideo.js
import mongoose from 'mongoose';

const homeVideoSchema = new mongoose.Schema({
  filename: String,
  path: String,
}, { timestamps: true });

export default mongoose.model('HomeVideo', homeVideoSchema);
