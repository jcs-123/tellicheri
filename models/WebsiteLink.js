// models/WebsiteLink.js
import mongoose from 'mongoose';

const websiteLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  webLink: { type: String, required: true },
  pageType: { type: String, required: true }, // Example: "Archdiocesan Websites"
  status: { type: String, default: 'A' } // A = Active
}, { timestamps: true });

export default mongoose.model('WebsiteLink', websiteLinkSchema);
