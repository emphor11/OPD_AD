const Medicine = require('../models/Medicine');
const Dispense = require('../models/Dispense');
const { sendPushNotification } = require('../utils/push');

// @desc List medicines in hospital inventory with low-stock flags
// @route GET /api/medicines
const listMedicines = async (req, res) => {
  try {
    const hospitalId = req.query.hospitalId || req.user.hospitalId;
    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID required' });
    }

    const medicines = await Medicine.find({ hospitalId }).sort({ name: 1 }).lean();

    const enriched = medicines.map((med) => ({
      ...med,
      isLowStock: med.quantity < med.minLevel,
    }));

    const lowStockCount = enriched.filter((m) => m.isLowStock).length;

    res.status(200).json({
      medicines: enriched,
      lowStockCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error listing medicines' });
  }
};

// @desc Add new medicine to hospital inventory
// @route POST /api/medicines
const createMedicine = async (req, res) => {
  try {
    const hospitalId = req.body.hospitalId || req.user.hospitalId;
    const { name, quantity, unit, minLevel } = req.body;

    if (!name || quantity === undefined) {
      return res.status(400).json({ message: 'Medicine name and initial quantity are required.' });
    }

    const medicine = new Medicine({
      hospitalId,
      name: name.trim(),
      quantity: Math.max(0, parseInt(quantity, 10)),
      unit: unit || 'tablets',
      minLevel: minLevel !== undefined ? parseInt(minLevel, 10) : 20,
    });

    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating medicine' });
  }
};

// @desc Edit or restock medicine
// @route PUT /api/medicines/:id
const updateMedicine = async (req, res) => {
  try {
    const { name, quantity, addQuantity, unit, minLevel } = req.body;
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (name) medicine.name = name;
    if (unit) medicine.unit = unit;
    if (minLevel !== undefined) medicine.minLevel = minLevel;

    // Either overwrite quantity or increment via addQuantity
    if (addQuantity !== undefined) {
      medicine.quantity += parseInt(addQuantity, 10);
    } else if (quantity !== undefined) {
      medicine.quantity = Math.max(0, parseInt(quantity, 10));
    }

    await medicine.save();
    res.status(200).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating medicine' });
  }
};

// @desc Record medicine dispensation and deduct inventory
// @route POST /api/medicines/dispense
const dispenseMedicine = async (req, res) => {
  try {
    const { medicineId, patientId, quantity, tokenId, admissionId } = req.body;
    const hospitalId = req.user.hospitalId;

    if (!medicineId || !patientId || !quantity) {
      return res.status(400).json({ message: 'Medicine ID, patient ID, and quantity are required.' });
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive integer.' });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicine.quantity < qtyNum) {
      return res.status(400).json({
        message: `Insufficient stock. Only ${medicine.quantity} ${medicine.unit} available.`,
      });
    }

    // Deduct stock
    medicine.quantity -= qtyNum;
    await medicine.save();

    // Create Dispense document
    const dispense = new Dispense({
      hospitalId: medicine.hospitalId || hospitalId,
      medicineId,
      patientId,
      tokenId: tokenId || null,
      admissionId: admissionId || null,
      quantity: qtyNum,
      dispensedBy: req.user._id,
    });
    await dispense.save();

    // Low-stock alert trigger
    const isNowLow = medicine.quantity < medicine.minLevel;
    if (isNowLow) {
      if (req.io) {
        req.io.to(`hospital:${medicine.hospitalId}`).emit('stock:low', medicine);
      }
      sendPushNotification({
        userId: req.user._id,
        title: '⚠️ Low Stock Alert!',
        body: `${medicine.name} is now down to ${medicine.quantity} ${medicine.unit} (Below safe threshold of ${medicine.minLevel}).`,
        type: 'stock',
        data: { medicineId: medicine._id },
      }).catch((e) => console.error('[Stock Alert Push Error]', e.message));
    }

    res.status(200).json({
      message: `Successfully dispensed ${qtyNum} ${medicine.unit} of ${medicine.name}`,
      dispense,
      updatedMedicine: medicine,
      isLowStock: isNowLow,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error dispensing medicine' });
  }
};

module.exports = {
  listMedicines,
  createMedicine,
  updateMedicine,
  dispenseMedicine,
};
