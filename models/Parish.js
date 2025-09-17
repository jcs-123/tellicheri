import mongoose from 'mongoose';

const parishSchema = new mongoose.Schema({
  id: String,
  archival_code: String,
  name: String,
  place: String,
  patron_name: String,
  parish_type: String,
  shrine: String,
  forane_name: String,
  parish_coordinators: String,
  address: String,
  phone: String,
  mobile: String,
  whatsapp_number: String,
  pan_card_num: String,
  grade: String,
  email: String,
  website: String,
  area: Number,
  no_family_units: Number,
  no_families: Number,
  total_population: Number,
  estb_date: Date,
  latitude: Number,
  longitude: Number,
  status: String,
  vicar_name: String,
  asst_vicar_names: String,
  resident_vicar_names: String
}, { timestamps: true });

export default mongoose.model('Parish', parishSchema);