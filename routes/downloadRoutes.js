const express = require('express');
const router = express.Router();
const {
  getDownloadRequests,
  createDownloadRequest,
  getAllDownloadRequests,
  updateDownloadRequest,
} = require('../controllers/downloadController');
const { protectSchool, protectSuperAdmin } = require('../middleware/auth');

// School Admin Routes
router.get('/requests', protectSchool, getDownloadRequests);
router.post('/requests', protectSchool, createDownloadRequest);

// Super Admin Routes
router.get('/admin/requests', protectSuperAdmin, getAllDownloadRequests);
router.put('/admin/requests/:id', protectSuperAdmin, updateDownloadRequest);

module.exports = router;



