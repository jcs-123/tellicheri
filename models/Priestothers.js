import mongoose from 'mongoose';

const priestothersSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  status: String
}, { timestamps: true });

export default mongoose.model('PriestStatus', priestothersSchema);