const mongoose = require('mongoose');

const AdministrationSchema = new mongoose.Schema({
  submenu: String,
  category: String,
  head_name: String,
  head_type: String,
  designation: String,
  phone_no: String,
});

module.exports = mongoose.model('Administration', AdministrationSchema);
