import mongoose from 'mongoose';

const priestSchema = new mongoose.Schema({
  id: String,
  archival_code: String,

  name: String,
  official_name: String,
  batch: String,
  baptism_name: String,
  designation: String,

  home_parish_id: String,
  home_parish: String,
  current_place: String,
  house_name: String,
  place: String,

  placeofbirth: String,
  placeofbaptism: String,
  baptism_date: Date,

  present_address: String,
  phone: String,
  mobile: String,
  whatsapp: String,
  email: String,

  dob: Date,
  feast_day: String,
  feast_month: String,
  patron: String,

  join_seminary: Date,
  ordination_date: Date,
  ordination_place: String,
  celebrant: String,

  father_name: String,
  mother_name: String,

  web_priest_status_id: String,
  web_priest_sub_status_id: String,
  web_priest_secondary_sub_status_id: String,

  expired: String,
  education: String,
  latest_appoint_year: String,
  languages: String,

  // ✅ IMPORTANT
  photo: String,   // <-- filename only (e.g. 2_693925248.jpg)

}, {
  timestamps: true
});

priestSchema.index({ id: 1 });
priestSchema.index({ name: 1 });

export default mongoose.model('Priest', priestSchema);
