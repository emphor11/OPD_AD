const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');
const {
  listAllHospitals,
  verifyHospital,
  getStats,
  listUsers,
} = require('../controllers/admin.controller');

// All admin routes require admin role
router.use(verifyJWT, allowRoles('admin'));

router.get('/hospitals', listAllHospitals);
router.put('/hospitals/:id/verify', verifyHospital);
router.get('/stats', getStats);
router.get('/users', listUsers);

module.exports = router;
