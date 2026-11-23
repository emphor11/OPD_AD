const mongoose = require('mongoose');

const opdSessionSchema = new mongoose.Schema(
  {
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
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    currentTokenNo: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastTokenNo: {
      type: Number,
      default: 0,
      min: 0,
    },
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index so only one session exists per department per day per hospital
opdSessionSchema.index({ hospitalId: 1, departmentCode: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('OpdSession', opdSessionSchema);
