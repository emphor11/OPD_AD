const Hospital = require('../models/Hospital');
const User = require('../models/User');

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
  getStats,
  listUsers,
};
