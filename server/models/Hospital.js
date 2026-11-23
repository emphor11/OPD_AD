const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avgConsultMins: {
      type: Number,
      default: 8,
      min: 1,
    },
  },
  { _id: false }
);

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Hospital address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      trim: true,
    },
    location: {
      lat: { type: Number, required: true, default: 28.6139 },
      lng: { type: Number, required: true, default: 77.2090 },
    },
    departments: {
      type: [departmentSchema],
      default: [
        { code: 'GM', name: 'General Medicine', avgConsultMins: 8 },
        { code: 'PED', name: 'Pediatrics', avgConsultMins: 10 },
        { code: 'ORTHO', name: 'Orthopedics', avgConsultMins: 12 },
        { code: 'ENT', name: 'ENT Clinic', avgConsultMins: 8 },
        { code: 'GYN', name: 'Gynecology & Obstetrics', avgConsultMins: 10 },
        { code: 'CARD', name: 'Cardiology', avgConsultMins: 15 },
      ],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
