const School = require('../models/School');
const Subject = require('../models/Subject');
const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

// @desc    Get Super Admin dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Super Admin)
exports.getSuperAdminStats = async (req, res) => {
  try {
    // Get total schools (active)
    const totalSchools = await School.countDocuments({ isActive: true });

    // Get total subjects (active)
    const totalSubjects = await Subject.countDocuments({ isActive: true });

    // Get total videos (active)
    const totalVideos = await Video.countDocuments({ isActive: true });

    // Calculate storage used from video file sizes
    const videos = await Video.find({ isActive: true }).select('fileSize');
    let totalStorageBytes = 0;
    videos.forEach(video => {
      if (video.fileSize) {
        totalStorageBytes += video.fileSize;
      }
    });

    // Convert bytes to human-readable format
    const formatStorage = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const storageUsed = formatStorage(totalStorageBytes);

    res.status(200).json({
      success: true,
      data: {
        totalSchools,
        totalSubjects,
        totalVideos,
        storageUsed,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};


