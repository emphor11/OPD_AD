const Admission = require('../models/Admission');
const Bed = require('../models/Bed');
const { computeFreeBedSummary } = require('./bed.controller');

// @desc Create admission request (Patient)
// @route POST /api/admissions
const createAdmission = async (req, res) => {
  try {
    const { hospitalId, bedType, reason, urgency, note } = req.body;
    const patientId = req.user._id;

    if (!hospitalId || !bedType || !reason) {
      return res.status(400).json({ message: 'Hospital, bed type, and reason are required.' });
    }

    let reportUrl = null;
    if (req.file) {
      reportUrl = `/uploads/${req.file.filename}`;
    }

    const admission = new Admission({
      patientId,
      hospitalId,
      bedType: bedType.toLowerCase(),
      reason,
      urgency: urgency || 'normal',
      note: note || '',
      reportUrl,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          at: new Date(),
          by: patientId,
        },
      ],
    });

    await admission.save();

    // Broadcast new admission alert to hospital staff
    if (req.io) {
      req.io.to(`hospital:${hospitalId}`).emit('admission:new', admission);
    }

    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating admission request' });
  }
};

// @desc Get patient's admission requests
// @route GET /api/admissions/mine
const getMyAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find({ patientId: req.user._id })
      .populate('hospitalId', 'name address phone')
      .populate('bedId', 'bedNo ward type status')
      .sort({ createdAt: -1 });

    res.status(200).json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching user admissions' });
  }
};

// @desc Get incoming admission requests for hospital (Staff)
// @route GET /api/admissions/incoming
const getHospitalAdmissions = async (req, res) => {
  try {
    const hospitalId = req.query.hospitalId || req.user.hospitalId;
    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID required' });
    }

    const { status, urgency } = req.query;
    const query = { hospitalId };

    if (status && status !== 'all') query.status = status;
    if (urgency && urgency !== 'all') query.urgency = urgency;

    const admissions = await Admission.find(query)
      .populate('patientId', 'name phone age gender bloodGroup')
      .populate('bedId', 'bedNo ward type')
      .sort({ createdAt: -1 });

    res.status(200).json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching incoming admissions' });
  }
};

// @desc Get admission detail by ID
// @route GET /api/admissions/:id
const getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate('patientId', 'name phone age gender bloodGroup')
      .populate('hospitalId', 'name address phone')
      .populate('bedId', 'bedNo ward type status');

    if (!admission) {
      return res.status(404).json({ message: 'Admission request not found' });
    }

    res.status(200).json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching admission detail' });
  }
};

// @desc Update admission status (Approve, Reject, Admit with bedId, Discharge, Cancel)
// @route PUT /api/admissions/:id/status
const updateAdmissionStatus = async (req, res) => {
  try {
    const { status, bedId, note } = req.body;
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({ message: 'Admission request not found' });
    }

    // Patient can only cancel their own pending request
    if (req.user.role === 'patient') {
      if (String(admission.patientId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Unauthorized to modify this admission request.' });
      }
      if (status !== 'cancelled' || admission.status !== 'pending') {
        return res.status(400).json({ message: 'Patients can only cancel pending requests.' });
      }
    }

    // Bed assignment logic on admission
    if (status === 'admitted') {
      if (!bedId) {
        return res.status(400).json({ message: 'A vacant bedId is required to admit patient.' });
      }

      const bed = await Bed.findById(bedId);
      if (!bed) {
        return res.status(404).json({ message: 'Assigned bed not found.' });
      }
      if (bed.status !== 'free') {
        return res.status(400).json({ message: `Bed ${bed.bedNo} is currently ${bed.status}.` });
      }

      // Mark bed as occupied by this admission
      bed.status = 'occupied';
      bed.admissionId = admission._id;
      await bed.save();

      admission.bedId = bed._id;
    }

    // Bed release logic on discharge
    if (status === 'discharged' && admission.bedId) {
      const assignedBed = await Bed.findById(admission.bedId);
      if (assignedBed) {
        assignedBed.status = 'free';
        assignedBed.admissionId = null;
        await assignedBed.save();
      }
    }

    admission.status = status;
    if (note) admission.note = note;

    admission.statusHistory.push({
      status,
      at: new Date(),
      by: req.user._id,
    });

    await admission.save();

    // Broadcast socket events
    if (req.io) {
      req.io.to(`user:${admission.patientId}`).emit('admission:status', {
        admissionId: admission._id,
        status,
        bedId: admission.bedId,
      });

      req.io.to(`admission:${admission._id}`).emit('admission:status', {
        admissionId: admission._id,
        status,
      });

      // Update bed counts city-wide and hospital-wide if bed changed
      if (status === 'admitted' || status === 'discharged') {
        const freeSummary = await computeFreeBedSummary(admission.hospitalId);
        req.io.to(`hospital:${admission.hospitalId}`).emit('beds:updated', {
          hospitalId: admission.hospitalId,
          freeByType: freeSummary,
        });
        req.io.to('city').emit('beds:updated', {
          hospitalId: admission.hospitalId,
          freeByType: freeSummary,
        });
      }
    }

    res.status(200).json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating admission status' });
  }
};

module.exports = {
  createAdmission,
  getMyAdmissions,
  getHospitalAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
};
