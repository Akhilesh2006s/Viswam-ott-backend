const jwt = require('jsonwebtoken');
const School = require('../models/School');
const SuperAdmin = require('../models/SuperAdmin');

// Protect routes - School Admin
exports.protectSchool = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'viswam_ott_secret_key');
      req.school = await School.findById(decoded.id).select('-password');
      
      if (!req.school || !req.school.isActive) {
        return res.status(401).json({
          success: false,
          error: 'School account not found or inactive',
        });
      }
      
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Protect routes - Super Admin
exports.protectSuperAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'viswam_ott_secret_key');
      req.superAdmin = await SuperAdmin.findById(decoded.id).select('-password');
      
      if (!req.superAdmin || !req.superAdmin.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Super admin account not found or inactive',
        });
      }
      
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Combined middleware - allows either school or super admin
exports.protectSchoolOrSuperAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'viswam_ott_secret_key');
      
      // Try super admin first
      const superAdmin = await SuperAdmin.findById(decoded.id);
      if (superAdmin && superAdmin.isActive) {
        req.superAdmin = superAdmin;
        return next();
      }
      
      // Then try school
      const school = await School.findById(decoded.id);
      if (school && school.isActive) {
        req.school = school;
        return next();
      }
      
      return res.status(401).json({
        success: false,
        error: 'Account not found or inactive',
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};
