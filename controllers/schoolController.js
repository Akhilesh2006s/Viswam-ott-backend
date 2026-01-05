const School = require('../models/School');
const UsageReport = require('../models/UsageReport');

// @desc    Get all schools (Super Admin)
// @route   GET /api/schools
// @access  Private (Super Admin)
exports.getSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: schools.length,
      data: schools,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Get single school
// @route   GET /api/schools/:id
// @access  Private
exports.getSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id).select('-password');

    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'School not found',
      });
    }

    res.status(200).json({
      success: true,
      data: school,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Create school (Super Admin)
// @route   POST /api/schools
// @access  Private (Super Admin)
exports.createSchool = async (req, res) => {
  try {
    const school = await School.create(req.body);

    res.status(201).json({
      success: true,
      data: school,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// @desc    Update school (Super Admin)
// @route   PUT /api/schools/:id
// @access  Private (Super Admin)
exports.updateSchool = async (req, res) => {
  try {
    let school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'School not found',
      });
    }

    school = await School.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: school,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Delete school (Super Admin)
// @route   DELETE /api/schools/:id
// @access  Private (Super Admin)
exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'School not found',
      });
    }

    school.isActive = false;
    await school.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Get dashboard stats (School Admin)
// @route   GET /api/schools/dashboard
// @access  Private (School)
exports.getDashboardStats = async (req, res) => {
  try {
    const schoolId = req.school._id;
    
    // Get stats
    const Subject = require('../models/Subject');
    const Video = require('../models/Video');
    
    const totalSubjects = await Subject.countDocuments({ isActive: true });
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
    
    // Weekly active logins (views in the last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyLogins = await UsageReport.countDocuments({
      schoolId,
      action: 'view',
      timestamp: { $gte: weekAgo },
    });

    // Get subjects with video counts
    const subjects = await Subject.find({ isActive: true })
      .select('name classes videoCount')
      .sort({ name: 1 });

    // Get recent videos (last 4)
    const recentVideos = await Video.find({ isActive: true })
      .populate('subjectId', 'name')
      .select('title subjectId class duration thumbnailUrl createdAt')
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      data: {
        totalSubjects,
        totalVideos,
        storageUsed,
        weeklyActiveLogins: weeklyLogins,
        subjects: subjects.map(subject => ({
          _id: subject._id,
          name: subject.name,
          classes: subject.classes,
          videoCount: subject.videoCount || 0,
        })),
        recentVideos: recentVideos.map(video => ({
          _id: video._id,
          title: video.title,
          subject: video.subjectId?.name || 'Unknown',
          class: video.class,
          duration: video.duration || 'N/A',
          thumbnailUrl: video.thumbnailUrl,
          createdAt: video.createdAt,
        })),
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


