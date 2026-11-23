const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');
const {
  getHospitalBeds,
  createBed,
  updateBedStatus,
} = require('../controllers/bed.controller');

// All bed management routes require authentication
router.use(verifyJWT);

// Staff and Admin routes
router.get('/', allowRoles('staff', 'admin'), getHospitalBeds);
router.post('/', allowRoles('staff', 'admin'), createBed);
router.put('/:id', allowRoles('staff', 'admin'), updateBedStatus);

module.exports = router;
