const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');
const {
  bookToken,
  getMyTokens,
  getSessionTokens,
  updateTokenStatus,
} = require('../controllers/token.controller');

// All token operations require authentication
router.use(verifyJWT);

// Patient routes
router.post('/', bookToken);
router.get('/mine', getMyTokens);

// Staff routes
router.get('/session/:sessionId', allowRoles('staff', 'admin'), getSessionTokens);

// Status update (patient cancel / staff complete/skip)
router.put('/:id/status', updateTokenStatus);

module.exports = router;
