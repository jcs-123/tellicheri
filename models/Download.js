const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  fileUrl: { type: String, required: true },
  displayOrder: { type: String },
  isActive: { type: Boolean, default: true }, // true = active, false = inactive
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Download', downloadSchema);
