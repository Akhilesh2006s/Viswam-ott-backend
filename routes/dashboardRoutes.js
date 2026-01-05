const express = require('express');
const router = express.Router();
const { getSuperAdminStats } = require('../controllers/dashboardController');
const { protectSuperAdmin } = require('../middleware/auth');

// Super Admin Dashboard Routes
router.get('/stats', protectSuperAdmin, getSuperAdminStats);

module.exports = router;


