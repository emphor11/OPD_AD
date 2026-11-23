const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'carequeue_super_secret_jwt_key_2026_delhi',
    { expiresIn: '30d' }
  );
};

// @desc Register new user (patient or staff)
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, age, gender, bloodGroup, location, hospitalId } =
      req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Name, email, password, and phone are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: role || 'patient',
      age,
      gender,
      bloodGroup,
      location,
      hospitalId,
    });

    await user.save();
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error registering user' });
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error logging in' });
  }
};

module.exports = {
  register,
  login,
};
