import mongoose from 'mongoose';

const priestSecondarySubStatusSchema = new mongoose.Schema({
  id: {
    type: String,

  },
  main_status_id: {
    type: String,
    required: true
  },
  secondary_status_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  display_order: {
    type: Number,
    default: 0
  },
  state: {
    type: String,
    default: 'A' // A for active, I for inactive
  },
  updated_by: {
    type: String
  },
  updated_date: {
    type: Date
  },
  // Additional fields
  description: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
priestSecondarySubStatusSchema.index({ id: 1 });
priestSecondarySubStatusSchema.index({ main_status_id: 1 });
priestSecondarySubStatusSchema.index({ secondary_status_id: 1 });
priestSecondarySubStatusSchema.index({ status: 1 });
priestSecondarySubStatusSchema.index({ 
  main_status_id: 1, 
  secondary_status_id: 1, 
  status: 1 
}, { unique: true });

const PriestSecondarySubStatus = mongoose.model('PriestSecondarySubStatus', priestSecondarySubStatusSchema);

export default PriestSecondarySubStatus;