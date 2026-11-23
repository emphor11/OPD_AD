const User = require('../models/User');

// @desc Get current logged-in user profile
// @route GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('hospitalId', 'name address phone verified');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching user profile' });
  }
};

// @desc Update user profile & demographics
// @route PUT /api/users/me
const updateMe = async (req, res) => {
  try {
    const { name, phone, age, gender, bloodGroup, location } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (age !== undefined) user.age = age;
    if (gender) user.gender = gender;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (location) user.location = location;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating profile' });
  }
};

// @desc Save Expo push notification token
// @route PUT /api/users/push-token
const savePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) {
      return res.status(400).json({ message: 'Push token is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { pushToken },
      { new: true }
    );

    res.status(200).json({ message: 'Push token registered successfully', pushToken: user.pushToken });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error saving push token' });
  }
};

module.exports = {
  getMe,
  updateMe,
  savePushToken,
};
