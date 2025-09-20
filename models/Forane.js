import mongoose from 'mongoose';

const foraneSchema = new mongoose.Schema({
  id: String,
  archival_code: String,
  sacellum_id: String,
  name: String,
  place: String,
  description: String,
  status: String,
  inserted_by: String,
  inserted_date: Date,
  updated_by: String,
  updated_date: Date
}, { 
  timestamps: true 
});

// Create indexes for better query performance
foraneSchema.index({ id: 1 });
foraneSchema.index({ archival_code: 1 });
foraneSchema.index({ name: 1 });
foraneSchema.index({ place: 1 });
foraneSchema.index({ status: 1 });

export default mongoose.model('Forane', foraneSchema);