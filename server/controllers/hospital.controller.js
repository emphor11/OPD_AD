const Hospital = require('../models/Hospital');
const User = require('../models/User');
const { calculateDistance } = require('../utils/distance');

// @desc Create a new hospital (Staff only)
// @route POST /api/hospitals
const createHospital = async (req, res) => {
  try {
    const { name, address, phone, location, departments } = req.body;

    if (!name || !address || !phone) {
      return res.status(400).json({ message: 'Hospital name, address, and phone are required.' });
    }

    const hospital = new Hospital({
      name,
      address,
      phone,
      location: location || { lat: 28.6139, lng: 77.2090 },
      departments: departments && departments.length > 0 ? departments : undefined,
      createdBy: req.user._id,
      verified: false, // Default requires City Admin verification
    });

    await hospital.save();

    // Link staff user to this hospital
    await User.findByIdAndUpdate(req.user._id, { hospitalId: hospital._id });

    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating hospital' });
  }
};

// @desc Get verified hospitals sorted by distance
// @route GET /api/hospitals/nearby?lat=...&lng=...
const listNearbyHospitals = async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat) || 28.6139; // Default Delhi Central
    const userLng = parseFloat(req.query.lng) || 77.2090;

    // Only return VERIFIED hospitals to patients
    const hospitals = await Hospital.find({ verified: true }).lean();

    const withDistance = hospitals.map((hosp) => {
      const distanceKm = hosp.location?.lat && hosp.location?.lng
        ? calculateDistance(userLat, userLng, hosp.location.lat, hosp.location.lng)
        : null;

      return {
        ...hosp,
        distanceKm,
        // Bed counts and queue metrics populated dynamically or defaults
        totalWaiting: 0,
        freeBeds: { general: 0, icu: 0, oxygen: 0, ventilator: 0, pediatric: 0 },
      };
    });

    // Sort ascending by distance
    withDistance.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

    res.status(200).json(withDistance);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching nearby hospitals' });
  }
};

// @desc Get hospital detail by ID
// @route GET /api/hospitals/:id
const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching hospital details' });
  }
};

// @desc Update hospital details (Staff owner or admin)
// @route PUT /api/hospitals/:id
const updateHospital = async (req, res) => {
  try {
    const { name, address, phone, location, departments } = req.body;
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Check ownership if staff
    if (req.user.role === 'staff' && String(hospital.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You are not authorized to edit this hospital.' });
    }

    if (name) hospital.name = name;
    if (address) hospital.address = address;
    if (phone) hospital.phone = phone;
    if (location) hospital.location = location;
    if (departments) hospital.departments = departments;

    await hospital.save();
    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating hospital' });
  }
};

module.exports = {
  createHospital,
  listNearbyHospitals,
  getHospitalById,
  updateHospital,
};
