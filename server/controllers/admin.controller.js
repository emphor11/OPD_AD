const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Token = require('../models/Token');
const Admission = require('../models/Admission');
const { computeFreeBedSummary } = require('./bed.controller');

// @desc Get City-Wide Dashboard metrics across all Delhi hospitals
// @route GET /api/admin/city-dashboard
const getCityDashboard = async (req, res) => {
  try {
    const verifiedHospitals = await Hospital.find({ verified: true }).lean();

    const cityTotals = {
      totalHospitals: verifiedHospitals.length,
      totalWaitingOPD: 0,
      totalPendingAdmissions: 0,
      totalCriticalAdmissions: 0,
      freeBeds: { general: 0, icu: 0, oxygen: 0, ventilator: 0, pediatric: 0 },
    };

    const hospitalStats = await Promise.all(
      verifiedHospitals.map(async (hosp) => {
        const freeBeds = await computeFreeBedSummary(hosp._id);

        const waitingOPD = await Token.countDocuments({
          hospitalId: hosp._id,
          status: 'waiting',
        });

        const pendingAdmissions = await Admission.countDocuments({
          hospitalId: hosp._id,
          status: 'pending',
        });

        const criticalAdmissions = await Admission.countDocuments({
          hospitalId: hosp._id,
          status: 'pending',
          urgency: 'critical',
        });

        // Add to city totals
        cityTotals.totalWaitingOPD += waitingOPD;
        cityTotals.totalPendingAdmissions += pendingAdmissions;
        cityTotals.totalCriticalAdmissions += criticalAdmissions;

        Object.keys(freeBeds).forEach((key) => {
          cityTotals.freeBeds[key] += freeBeds[key];
        });

        return {
          _id: hosp._id,
          name: hosp.name,
          address: hosp.address,
          location: hosp.location,
          freeBeds,
          waitingOPD,
          pendingAdmissions,
          criticalAdmissions,
        };
      })
    );

    res.status(200).json({
      cityTotals,
      hospitals: hospitalStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error generating city dashboard' });
  }
};

// @desc List all hospitals for admin review
// @route GET /api/admin/hospitals
const listAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .populate('createdBy', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error listing hospitals' });
  }
};

// @desc Verify or reject a hospital
// @route PUT /api/admin/hospitals/:id/verify
const verifyHospital = async (req, res) => {
  try {
    const { verified } = req.body;
    const isVerified = verified !== undefined ? verified : true;

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { verified: isVerified },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.status(200).json({
      message: `Hospital ${isVerified ? 'verified' : 'unverified'} successfully`,
      hospital,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error verifying hospital' });
  }
};

// @desc Get system-wide totals
// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    const verifiedHospitals = await Hospital.countDocuments({ verified: true });
    const pendingHospitals = totalHospitals - verifiedHospitals;

    res.status(200).json({
      totalUsers,
      totalHospitals,
      verifiedHospitals,
      pendingHospitals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching system stats' });
  }
};

// @desc List all users for admin
// @route GET /api/admin/users
const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error listing users' });
  }
};

module.exports = {
  listAllHospitals,
  verifyHospital,
  getCityDashboard,
  getStats,
  listUsers,
};
