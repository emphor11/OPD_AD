const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notification.controller');

router.use(verifyJWT);

router.get('/', getMyNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
