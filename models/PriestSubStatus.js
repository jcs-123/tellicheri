import mongoose from 'mongoose';

const priestSubStatusSchema = new mongoose.Schema({
  id: {
    type: String,

  },
  main_status_id: {
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
  // Additional fields if needed
  description: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for better performance
priestSubStatusSchema.index({ id: 1 });
priestSubStatusSchema.index({ main_status_id: 1 });
priestSubStatusSchema.index({ status: 1 });

const PriestSubStatus = mongoose.model('PriestSubStatus', priestSubStatusSchema);

export default PriestSubStatus;