const express = require('express');
const router = express.Router();
const {
  getVideos,
  getVideo,
  getRecentVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  downloadVideo,
} = require('../controllers/videoController');
const { protectSchool, protectSuperAdmin, protectSchoolOrSuperAdmin } = require('../middleware/auth');
const { uploadVideoAndThumbnail } = require('../middleware/upload');

// School Admin Routes (Super Admin can also access)
router.get('/', protectSchoolOrSuperAdmin, getVideos);
router.get('/recent', protectSchool, getRecentVideos);
router.get('/:id', protectSchool, getVideo);
router.get('/:id/download', protectSchool, downloadVideo);

// Super Admin Routes
router.post('/', protectSuperAdmin, (req, res, next) => {
  uploadVideoAndThumbnail(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload error',
      });
    }
    next();
  });
}, createVideo);
router.put('/:id', protectSuperAdmin, updateVideo);
router.delete('/:id', protectSuperAdmin, deleteVideo);

module.exports = router;


