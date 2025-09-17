import mongoose from 'mongoose';

const priestSchema = new mongoose.Schema({
  id: String,
  archival_code: String,
  name: String,
  official_name: String,
  batch: String,
  baptism_name: String,
  designation: String,
  diocese_id: String,
  home_parish_id: String,
  home_parish: String,
  works_under: String,
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
  facebook: String,
  twitter: String,
  linkedin: String,
  googleplus: String,
  instagram: String,
  dob: Date,
  feast_day: String,
  feast_month: String,
  patron: String,
  join_seminary: Date,
  ordination_date: Date,
  ordination_place: String,
  celebrant_id: String,
  celebrant: String,
  profession_date: Date,
  death_date: Date,
  place_of_death: String,
  place_of_burial: String,
  father_name: String,
  mother_name: String,
  brothers: String,
  sisters: String,
  blood: String,
  web_priest_status_id: String,
  web_priest_sub_status_id: String,
  web_priest_secondary_sub_status_id: String,
  expired: String,
  remarks: String,
  education: String,
  latest_appoint_year: String,
  languages: String,
  initiatives: String,
  publications: String,
  a_contributions: String
}, { 
  timestamps: true 
});

// Create indexes for better query performance
priestSchema.index({ id: 1 });
priestSchema.index({ email: 1 });
priestSchema.index({ mobile: 1 });
priestSchema.index({ name: 1 });

export default mongoose.model('Priest', priestSchema);