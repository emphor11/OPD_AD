const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');
const {
  createHospital,
  listNearbyHospitals,
  getHospitalById,
  updateHospital,
} = require('../controllers/hospital.controller');

// Public / Patient endpoints
router.get('/nearby', listNearbyHospitals);
router.get('/:id', getHospitalById);

// Protected Staff endpoints
router.post('/', verifyJWT, allowRoles('staff', 'admin'), createHospital);
router.put('/:id', verifyJWT, allowRoles('staff', 'admin'), updateHospital);

module.exports = router;
