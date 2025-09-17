import mongoose from "mongoose";

const priestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  archival_code: { type: String, default: "-" },

  // Basic identity
  name: { type: String, required: true },          // GEORGE1
  official_name: { type: String },
  baptism_name: { type: String },
  batch: { type: String },
  designation: { type: String },
  diocese_id: { type: String },

  // Parish details
  home_parish_id: { type: String },
  home_parish: { type: String },
  current_place: { type: String },
  works_under: { type: String },
  parish: { type: String },

  // Personal info
  house_name: { type: String },
  place: { type: String },
  placeofbirth: { type: String },
  placeofbaptism: { type: String },
  baptism_date: { type: Date },
  dob: { type: Date },
  feast_day: { type: String },
  feast_month: { type: String },
  patron: { type: String },
  blood: { type: String },

  // Family
  father_name: { type: String },
  mother_name: { type: String },
  brothers: { type: String },
  sisters: { type: String },

  // Contact
  present_address: { type: String },
  phone: { type: String },
  mobile: { type: String },
  whatsapp: { type: String },
  email: { type: String },
  facebook: { type: String },
  twitter: { type: String },
  linkedin: { type: String },
  googleplus: { type: String },
  instagram: { type: String },

  // Priesthood journey
  join_seminary: { type: Date },
  ordination_date: { type: Date },
  ordination_place: { type: String },
  celebrant_id: { type: String },
  celebrant: { type: String },
  profession_date: { type: Date },
  death_date: { type: Date },
  place_of_death: { type: String },
  place_of_burial: { type: String },

  // Extra details
  web_priest_status_id: { type: String },
  web_priest_sub_status_id: { type: String },
  web_priest_secondary_sub_status_id: { type: String },
  expired: { type: String, enum: ["Y", "N"], default: "N" },
  remarks: { type: String },
  education: { type: String },         // could later be ref to PriestEducation
  latest_appoint_year: { type: String },
  languages: { type: String },
  initiatives: { type: String },
  publications: { type: String },
  a_contributions: { type: String },
}, { timestamps: true });

export default mongoose.models.Priest || mongoose.model("Priest", priestSchema);
