const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { getMe, updateMe, savePushToken } = require('../controllers/user.controller');

router.get('/me', verifyJWT, getMe);
router.put('/me', verifyJWT, updateMe);
router.put('/push-token', verifyJWT, savePushToken);

module.exports = router;
