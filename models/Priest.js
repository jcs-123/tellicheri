import mongoose from 'mongoose';

const priestSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  phone: String,
  status: String,
  designation: String,
  parish_id: String,
}, { timestamps: true });

export default mongoose.model('Priest', priestSchema);