// models/priest.js
import mongoose from "mongoose";

const priestSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  designation: String,
  address: String,
  parish: String,
  phone: String,
  email: String,
  photo: String,
  serviceHistory: [{
    type: String,
    place: String,
    designation: String,
    duration: String
  }]
}, { timestamps: true });

export default mongoose.model("Priest", priestSchema);
