const express = require('express');
const router = express.Router();
const {
  getReports,
  getSubjectWiseUsage,
  trackUsage,
} = require('../controllers/reportController');
const { protectSchool } = require('../middleware/auth');

router.get('/', protectSchool, getReports);
router.get('/subject-wise', protectSchool, getSubjectWiseUsage);
router.post('/track', protectSchool, trackUsage);

module.exports = router;



