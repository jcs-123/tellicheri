import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  address: { type: String, default: "" },
  category: { type: String, required: true }
});

export default mongoose.models.PastoralCouncil || mongoose.model("PastoralCouncil", memberSchema);
