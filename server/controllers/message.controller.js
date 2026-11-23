const Message = require('../models/Message');
const Admission = require('../models/Admission');

// @desc Get chat messages for an admission thread
// @route GET /api/messages/:admissionId
const getAdmissionMessages = async (req, res) => {
  try {
    const { admissionId } = req.params;

    const messages = await Message.find({ admissionId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching messages' });
  }
};

// @desc Send a message in admission thread
// @route POST /api/messages/:admissionId
const sendMessage = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;

    if (!text && !req.file) {
      return res.status(400).json({ message: 'Message content or image is required.' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const message = new Message({
      admissionId,
      senderId,
      text: text || '',
      imageUrl,
    });

    await message.save();
    await message.populate('senderId', 'name role');

    // Real-Time WebSocket broadcast to everyone in the admission room
    if (req.io) {
      req.io.to(`admission:${admissionId}`).emit('message:new', message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error sending message' });
  }
};

module.exports = {
  getAdmissionMessages,
  sendMessage,
};
