// models/priest.js
import mongoose from "mongoose";

const serviceHistorySchema = new mongoose.Schema({
  // 👇 field named "type" must be declared this way
  type: { type: String },
  place: String,
  designation: String,
  duration: String
}, { _id: false });

const priestSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  designation: String,
  address: String,
  parish: String,
  phone: String,
  email: String,
  photo: String,
  serviceHistory: [serviceHistorySchema]
}, { timestamps: true });

export default mongoose.model("Priest", priestSchema);
