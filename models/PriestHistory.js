import mongoose from 'mongoose';

const priestHistorySchema = new mongoose.Schema({
  id: {
    type: String,
    
  },
  priest_id: {
    type: String,
    required: true
  },
  priest_name: {
    type: String
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date
  },
  designation: {
    type: String,
    required: true
  },
  category_type: {
    type: String,
    required: true
  },
  service_type: {
    type: String,
    required: true
  },
  category_id: {
    type: String,
    required: true
  },
  other: {
    type: String
  },
  main_designation: {
    type: String
  },
  updated_by: {
    type: String
  },
  updated_date: {
    type: Date
  },
  // Additional useful fields
  duration_days: {
    type: Number
  },
  is_current: {
    type: Boolean,
    default: false
  },
  location_name: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for better performance
priestHistorySchema.index({ id: 1 });
priestHistorySchema.index({ priest_id: 1 });
priestHistorySchema.index({ start_date: 1 });
priestHistorySchema.index({ end_date: 1 });
priestHistorySchema.index({ designation: 1 });
priestHistorySchema.index({ category_type: 1 });
priestHistorySchema.index({ service_type: 1 });
priestHistorySchema.index({ category_id: 1 });
priestHistorySchema.index({ priest_id: 1, start_date: 1 });

// Virtual for duration calculation
priestHistorySchema.virtual('duration').get(function() {
  if (!this.start_date || !this.end_date) return null;
  const diffTime = Math.abs(this.end_date - this.start_date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

const PriestHistory = mongoose.model('PriestHistory', priestHistorySchema);

export default PriestHistory;