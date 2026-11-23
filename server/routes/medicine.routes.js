const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');
const {
  listMedicines,
  createMedicine,
  updateMedicine,
  dispenseMedicine,
} = require('../controllers/medicine.controller');

// All medicine inventory endpoints require staff or admin authorization
router.use(verifyJWT, allowRoles('staff', 'admin'));

router.get('/', listMedicines);
router.post('/', createMedicine);
router.put('/:id', updateMedicine);
router.post('/dispense', dispenseMedicine);

module.exports = router;
