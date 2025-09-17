import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema({
  id: String,
  archival_code: String,
  name: String,
  parish: String,
  web_institution_type_id: String,
  web_institution_subtype_id: String,
  web_subsidiary_subtype_id: String,
  mgmnt_type: String,
  mgmnt_name: String,
  head: String,
  head_id: String,
  htype: String,
  hdesig: String,
  head_mobile: String,
  officials: String,
  place: String,
  address: String,
  email: String,
  website: String,
  phone: String,
  mobile: String,
  whatsapp_number: String,
  estd: Date,
  status: String
}, { 
  timestamps: true 
});

// Create indexes for better query performance
institutionSchema.index({ id: 1 });
institutionSchema.index({ name: 1 });
institutionSchema.index({ web_institution_type_id: 1 });
institutionSchema.index({ head_id: 1 });
institutionSchema.index({ status: 1 });

export default mongoose.model('Institution', institutionSchema);