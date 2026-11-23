const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['tablets', 'strips', 'bottles', 'units'],
      default: 'tablets',
    },
    minLevel: {
      type: Number,
      default: 20,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying hospital medicine inventory
medicineSchema.index({ hospitalId: 1, name: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
