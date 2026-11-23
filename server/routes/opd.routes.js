const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');
const {
  openSession,
  closeSession,
  getSessionById,
  callNextToken,
} = require('../controllers/opd.controller');

// Public route to view session info
router.get('/sessions/:id', getSessionById);

// Staff routes
router.post('/sessions', verifyJWT, allowRoles('staff', 'admin'), openSession);
router.put('/sessions/:id/close', verifyJWT, allowRoles('staff', 'admin'), closeSession);
router.post('/sessions/:id/next', verifyJWT, allowRoles('staff', 'admin'), callNextToken);

module.exports = router;
