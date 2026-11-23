const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const admissionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bedType: {
      type: String,
      enum: ['general', 'icu', 'oxygen', 'ventilator', 'pediatric'],
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Medical reason for admission is required'],
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'critical'],
      default: 'normal',
    },
    reportUrl: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'admitted', 'discharged', 'cancelled'],
      default: 'pending',
    },
    bedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
      default: null,
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for incoming triage queries by hospital and status
admissionSchema.index({ hospitalId: 1, status: 1, urgency: 1 });

module.exports = mongoose.model('Admission', admissionSchema);
