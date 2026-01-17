import mongoose from 'mongoose';

const priestEducationSchema = new mongoose.Schema({
  id: {
    type: String,
    
  },
  education_type: {
    type: String,
    required: true
  },
  web_priest_id: {
    type: String,
    required: true
  },
  course_type: {
    type: String,
    required: true
  },
  course: {
    type: String
  },
  institution: {
    type: String,
    required: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  updated_by: {
    type: String
  },
  updated_date: {
    type: Date
  },
  // Additional fields
  duration_years: {
    type: Number
  },
  is_completed: {
    type: Boolean,
    default: true
  },
  grade_percentage: {
    type: String
  },
  specialization: {
    type: String
  },
  location: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes
priestEducationSchema.index({ id: 1 });
priestEducationSchema.index({ web_priest_id: 1 });
priestEducationSchema.index({ education_type: 1 });
priestEducationSchema.index({ course_type: 1 });
priestEducationSchema.index({ institution: 1 });
priestEducationSchema.index({ web_priest_id: 1, start_date: 1 });

const PriestEducation = mongoose.model('PriestEducation', priestEducationSchema);

export default PriestEducation;