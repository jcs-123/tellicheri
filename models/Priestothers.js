import mongoose from 'mongoose';

const priestOthersSchema = new mongoose.Schema({
  id: String,
  name: String,
  house_name: String,
  designation: String,
  phone: String,
  mobile: String,
  email: String,
  parish: String,
  education: String,
  belongs_to: String,
  diocese_con: String,
  ordination_date: Date,
  present_address: String,
  home_address: String,
  remarks: String,
  place: String,
  dob: Date,
  feast_date: Date,
  patron_saint: String,
  date_profession: Date,
  congregation_id: String,
  congregation: String,
  category: String,
  insourced_category: String,
  insourced_category_id: String,
  insourced_category_other_name: String,
  status: String,
  expired: String,
  death_date: Date
}, { 
  timestamps: true 
});

// Create indexes for better query performance
priestOthersSchema.index({ id: 1 });
priestOthersSchema.index({ name: 1 });
priestOthersSchema.index({ mobile: 1 });
priestOthersSchema.index({ category: 1 });

export default mongoose.model('PriestOthers', priestOthersSchema);