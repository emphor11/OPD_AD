const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OpdSession',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    departmentCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenNo: {
      type: Number,
      required: true,
    },
    displayNo: {
      type: String,
      required: true, // e.g. 'GM-014'
      trim: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'called', 'in_consultation', 'completed', 'skipped', 'cancelled'],
      default: 'waiting',
    },
    notifiedNear: {
      type: Boolean,
      default: false, // Flag so "your turn is in 3 patients" push is sent only once
    },
    calledAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a session's waiting list in token number order
tokenSchema.index({ sessionId: 1, status: 1, tokenNo: 1 });

module.exports = mongoose.model('Token', tokenSchema);
