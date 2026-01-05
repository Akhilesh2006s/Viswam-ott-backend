const jwt = require('jsonwebtoken');
const School = require('../models/School');
const SuperAdmin = require('../models/SuperAdmin');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'viswam_ott_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    School Admin Login
// @route   POST /api/auth/school/login
// @access  Public
exports.schoolLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    const school = await School.findOne({ email, isActive: true });

    if (!school) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Simple password check (in production, use bcrypt)
    if (school.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = generateToken(school._id);

    res.status(200).json({
      success: true,
      token,
      school: {
        id: school._id,
        name: school.name,
        email: school.email,
        downloadQuota: school.downloadQuota,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Super Admin Login
// @route   POST /api/auth/super-admin/login
// @access  Public
exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    const superAdmin = await SuperAdmin.findOne({ email, isActive: true });

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Simple password check (in production, use bcrypt)
    if (superAdmin.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = generateToken(superAdmin._id);

    res.status(200).json({
      success: true,
      token,
      superAdmin: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Get current logged in school
// @route   GET /api/auth/school/me
// @access  Private
exports.getSchool = async (req, res) => {
  try {
    const school = await School.findById(req.school._id).select('-password');

    res.status(200).json({
      success: true,
      data: school,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Get current logged in super admin
// @route   GET /api/auth/super-admin/me
// @access  Private
exports.getSuperAdmin = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(req.superAdmin._id).select('-password');

    res.status(200).json({
      success: true,
      data: superAdmin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};



