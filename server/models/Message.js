const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    admissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admission',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for chronological chat history retrieval
messageSchema.index({ admissionId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
