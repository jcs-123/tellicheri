// models/priest.js
import mongoose from "mongoose";

const priestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  address: { type: String, default: "" },
  photo: { type: String, default: "" },
  place: { type: String, default: "" },
  parish: { type: String, default: "" },
  status: { type: String, default: "" },
  dob: { type: String, default: "" },
  feastDay: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  serviceHistory: [{
    type: String,
    place: String,
    designation: String,
    duration: String
  }]
});

export default mongoose.models.Priest || mongoose.model("Priest", priestSchema);