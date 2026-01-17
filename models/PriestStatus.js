import mongoose from 'mongoose';

const priestStatusSchema = new mongoose.Schema({
  id: {
    type: String,
    
  },
  pstatus: {
    type: String,
    required: true,

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

// Create indexes
priestStatusSchema.index({ id: 1 });
priestStatusSchema.index({ pstatus: 1 });
priestStatusSchema.index({ display_order: 1 });

const PriestStatus = mongoose.model('PriestStatus', priestStatusSchema);

export default PriestStatus;