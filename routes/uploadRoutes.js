const express = require('express');
const router = express.Router();
const { protectSuperAdmin } = require('../middleware/auth');
const { uploadVideo, uploadThumbnail } = require('../middleware/upload');
const path = require('path');

// @desc    Upload video file
// @route   POST /api/upload/video
// @access  Private (Super Admin)
router.post('/video', protectSuperAdmin, uploadVideo, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file uploaded',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
        url: `http://localhost:3001/uploads/${req.file.filename}`,
      },
      message: 'Video uploaded successfully to local storage',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed',
    });
  }
});

// @desc    Upload thumbnail
// @route   POST /api/upload/thumbnail
// @access  Private (Super Admin)
router.post('/thumbnail', protectSuperAdmin, uploadThumbnail, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No thumbnail file uploaded',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
        url: `http://localhost:3001/uploads/${req.file.filename}`,
      },
      message: 'Thumbnail uploaded successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed',
    });
  }
});

module.exports = router;


