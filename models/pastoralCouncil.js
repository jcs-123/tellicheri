import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  type: String,
  place: String,
  designation: String,
  duration: String
});

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  address: { type: String, default: "" },
  category: { type: String, required: true },
  photo: { type: String, default: "" },
  place: { type: String, default: "" },
  parish: { type: String, default: "" },
  status: { type: String, default: "" },
  dob: { type: String, default: "" },
  feastDay: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  serviceHistory: [serviceSchema]
});

export default mongoose.models.PastoralCouncil || mongoose.model("PastoralCouncil", memberSchema);
