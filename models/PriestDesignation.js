import mongoose from 'mongoose';

const priestDesignationSchema = new mongoose.Schema({
  id: String,
  name: {
    type: String,
    required: true
  },
  sort_order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'A'
  },
  updated_by: String,
  updated_date: Date,
  // Additional fields
  category: String,
  description: String,
  is_active: {
    type: Boolean,
    default: true
  },
  level: {
    type: String,
    enum: ['Primary', 'Secondary', 'Tertiary']
  }
}, {
  timestamps: true
});

// Indexes
priestDesignationSchema.index({ id: 1 }, { unique: true, sparse: true });
priestDesignationSchema.index({ name: 1 }, { unique: true });
priestDesignationSchema.index({ sort_order: 1 });
priestDesignationSchema.index({ status: 1 });
priestDesignationSchema.index({ category: 1 });

const PriestDesignation = mongoose.model('PriestDesignation', priestDesignationSchema);
export default PriestDesignation;