// models/pastoralCouncil.js
import mongoose from "mongoose";

const pastoralCouncilSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  designation: String,
  address: String,
  // 👇 add this
  priestId: { type: mongoose.Schema.Types.ObjectId, ref: "Priest" }
}, { timestamps: true });

export default mongoose.model("PastoralCouncil", pastoralCouncilSchema);
