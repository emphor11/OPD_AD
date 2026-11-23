const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  createAdmission,
  getMyAdmissions,
  getHospitalAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
} = require('../controllers/admission.controller');

// All admission routes require authentication
router.use(verifyJWT);

// Patient endpoints
router.post('/', upload.single('report'), createAdmission);
router.get('/mine', getMyAdmissions);

// Staff endpoints
router.get('/incoming', allowRoles('staff', 'admin'), getHospitalAdmissions);

// Detail and Status update
router.get('/:id', getAdmissionById);
router.put('/:id/status', updateAdmissionStatus);

module.exports = router;
