const express = require('express');
const router = express.Router();
const {
  schoolLogin,
  superAdminLogin,
  getSchool,
  getSuperAdmin,
} = require('../controllers/authController');
const { protectSchool, protectSuperAdmin } = require('../middleware/auth');

// School Admin Routes
router.post('/school/login', schoolLogin);
router.get('/school/me', protectSchool, getSchool);

// Super Admin Routes
router.post('/super-admin/login', superAdminLogin);
router.get('/super-admin/me', protectSuperAdmin, getSuperAdmin);

module.exports = router;



