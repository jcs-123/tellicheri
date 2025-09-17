import mongoose from 'mongoose';

const administrationSchema = new mongoose.Schema({
  id: String,
  section: String,
  category: String,
  head_table_type: String,
  head_id: String,
  name_title: String,
  name: String,
  display_order: Number,
  designation: String,
  address: String,
  email: String,
  phone: String,
  mobile: String
}, { 
  timestamps: true 
});

// Create indexes for better query performance
administrationSchema.index({ id: 1 });
administrationSchema.index({ section: 1 });
administrationSchema.index({ category: 1 });
administrationSchema.index({ head_id: 1 });
administrationSchema.index({ name: 1 });

export default mongoose.model('Administration', administrationSchema);