const express = require('express');
const router = express.Router();
const {
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  getDashboardStats,
} = require('../controllers/schoolController');
const { protectSchool, protectSuperAdmin } = require('../middleware/auth');

// School Admin Routes
router.get('/dashboard', protectSchool, getDashboardStats);
router.get('/:id', protectSchool, getSchool);

// Super Admin Routes
router.get('/', protectSuperAdmin, getSchools);
router.post('/', protectSuperAdmin, createSchool);
router.put('/:id', protectSuperAdmin, updateSchool);
router.delete('/:id', protectSuperAdmin, deleteSchool);

module.exports = router;



