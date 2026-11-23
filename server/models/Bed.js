const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bedNo: {
      type: String,
      required: [true, 'Bed number is required'], // e.g. 'ICU-03', 'GEN-104'
      trim: true,
    },
    type: {
      type: String,
      enum: ['general', 'icu', 'oxygen', 'ventilator', 'pediatric'],
      required: [true, 'Bed type is required'],
    },
    ward: {
      type: String,
      required: [true, 'Ward designation is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['free', 'occupied', 'maintenance'],
      default: 'free',
    },
    admissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admission',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying free beds by type in a hospital
bedSchema.index({ hospitalId: 1, type: 1, status: 1 });

module.exports = mongoose.model('Bed', bedSchema);
