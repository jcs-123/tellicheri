import mongoose from "mongoose";

const serviceHistorySchema = new mongoose.Schema({
  type: { type: String, default: "" },
  place: { type: String, default: "" },
  designation: { type: String, default: "" },
  duration: { type: String, default: "" }
}, { _id: false });

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
  serviceHistory: { type: [serviceHistorySchema], default: [] }
});

export default mongoose.models.PastoralCouncil || mongoose.model("PastoralCouncil", memberSchema);
