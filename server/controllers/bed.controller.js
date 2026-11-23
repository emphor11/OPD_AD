const Bed = require('../models/Bed');

// Helper to compute free bed counts grouped by type for a hospital
const computeFreeBedSummary = async (hospitalId) => {
  const counts = await Bed.aggregate([
    {
      $match: {
        hospitalId: new (require('mongoose').Types.ObjectId)(hospitalId),
        status: 'free',
      },
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { general: 0, icu: 0, oxygen: 0, ventilator: 0, pediatric: 0 };
  counts.forEach((item) => {
    if (summary[item._id] !== undefined) {
      summary[item._id] = item.count;
    }
  });

  return summary;
};

// @desc Get all beds of user's hospital (Staff)
// @route GET /api/beds
const getHospitalBeds = async (req, res) => {
  try {
    const hospitalId = req.query.hospitalId || req.user.hospitalId;
    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID required' });
    }

    const { type, status } = req.query;
    const query = { hospitalId };

    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;

    const beds = await Bed.find(query)
      .populate('admissionId', 'patientId reason urgency')
      .sort({ type: 1, bedNo: 1 });

    const freeSummary = await computeFreeBedSummary(hospitalId);

    res.status(200).json({
      beds,
      freeSummary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching hospital beds' });
  }
};

// @desc Add a new bed to hospital (Staff)
// @route POST /api/beds
const createBed = async (req, res) => {
  try {
    const hospitalId = req.body.hospitalId || req.user.hospitalId;
    const { bedNo, type, ward, status } = req.body;

    if (!hospitalId || !bedNo || !type || !ward) {
      return res.status(400).json({ message: 'Bed number, type, ward, and hospital ID are required.' });
    }

    const existing = await Bed.findOne({ hospitalId, bedNo: bedNo.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: `Bed ${bedNo} already exists in this hospital.` });
    }

    const bed = new Bed({
      hospitalId,
      bedNo: bedNo.trim().toUpperCase(),
      type: type.toLowerCase(),
      ward,
      status: status || 'free',
    });

    await bed.save();

    // Broadcast bed count update via WebSockets
    if (req.io) {
      const freeSummary = await computeFreeBedSummary(hospitalId);
      req.io.to(`hospital:${hospitalId}`).emit('beds:updated', { hospitalId, freeByType: freeSummary });
      req.io.to('city').emit('beds:updated', { hospitalId, freeByType: freeSummary });
    }

    res.status(201).json(bed);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating bed' });
  }
};

// @desc Update bed status (free, occupied, maintenance)
// @route PUT /api/beds/:id
const updateBedStatus = async (req, res) => {
  try {
    const { status, admissionId, ward } = req.body;
    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (status) bed.status = status;
    if (ward) bed.ward = ward;
    if (admissionId !== undefined) bed.admissionId = admissionId;

    await bed.save();

    // Broadcast bed update
    if (req.io) {
      const freeSummary = await computeFreeBedSummary(bed.hospitalId);
      req.io.to(`hospital:${bed.hospitalId}`).emit('beds:updated', {
        hospitalId: bed.hospitalId,
        freeByType: freeSummary,
        updatedBed: bed,
      });
      req.io.to('city').emit('beds:updated', {
        hospitalId: bed.hospitalId,
        freeByType: freeSummary,
      });
    }

    res.status(200).json(bed);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating bed' });
  }
};

module.exports = {
  getHospitalBeds,
  createBed,
  updateBedStatus,
  computeFreeBedSummary,
};
