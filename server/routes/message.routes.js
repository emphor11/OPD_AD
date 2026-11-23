const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAdmissionMessages,
  sendMessage,
} = require('../controllers/message.controller');

router.use(verifyJWT);

router.get('/:admissionId', getAdmissionMessages);
router.post('/:admissionId', upload.single('image'), sendMessage);

module.exports = router;
