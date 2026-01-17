import mongoose from 'mongoose';

const foraneSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      index: true,
      unique: true,
      sparse: true
    },

    archival_code: {
      type: String,
      index: true,
      sparse: true
    },

    sacellum_id: {
      type: String,
      default: null
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    place: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    description: {
      type: String,
      default: null
    },

    status: {
      type: String,
      default: 'A',
      index: true
    },

    inserted_by: {
      type: String,
      default: null
    },

    inserted_date: {
      type: Date,
      default: null
    },

    updated_by: {
      type: String,
      default: null
    },

    updated_date: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/* ===============================
   COMPOUND & PERFORMANCE INDEXES
   =============================== */

// Prevent duplicate Foranes
foraneSchema.index(
  { name: 1, place: 1 },
  { unique: true }
);

// Faster filters
foraneSchema.index({ status: 1 });
foraneSchema.index({ inserted_date: -1 });
foraneSchema.index({ updated_date: -1 });

export default mongoose.model('Forane', foraneSchema);
