const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubject,
  getSubjectVideos,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protectSchool, protectSuperAdmin, protectSchoolOrSuperAdmin } = require('../middleware/auth');

// Public Routes (for both)
router.get('/', protectSchoolOrSuperAdmin, getSubjects);
router.get('/:id', protectSchool, getSubject);
router.get('/:id/videos', protectSchool, getSubjectVideos);

// Super Admin Routes
router.post('/', protectSuperAdmin, createSubject);
router.put('/:id', protectSuperAdmin, updateSubject);
router.delete('/:id', protectSuperAdmin, deleteSubject);

module.exports = router;


