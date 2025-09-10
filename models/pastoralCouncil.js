import mongoose from "mongoose";

const pastoralCouncilSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  address: { type: String },
  category: { type: String, required: true }
});

export default mongoose.model("PastoralCouncil", pastoralCouncilSchema);
