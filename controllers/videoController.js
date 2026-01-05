const Video = require('../models/Video');
const Subject = require('../models/Subject');
const UsageReport = require('../models/UsageReport');
const fs = require('fs');
const path = require('path');

// @desc    Get all videos (School Admin or Super Admin)
// @route   GET /api/videos
// @access  Private (School or Super Admin)
exports.getVideos = async (req, res) => {
  try {
    const { subjectId, class: classFilter, search } = req.query;
    
    let query = { isActive: true };
    
    if (subjectId) {
      query.subjectId = subjectId;
    }
    
    if (classFilter) {
      query.class = classFilter;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { chapter: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }

    const videos = await Video.find(query)
      .populate('subjectId', 'name classes')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private (School)
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('subjectId', 'name classes');

    if (!video || !video.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    // Track view (only for schools, not super admin)
    if (req.school) {
      await UsageReport.create({
        schoolId: req.school._id,
        subjectId: video.subjectId._id,
        videoId: video._id,
        action: 'view',
      });
      
      // Increment view count
      video.views += 1;
      await video.save();
    }

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Create video (Super Admin)
// @route   POST /api/videos
// @access  Private (Super Admin)
exports.createVideo = async (req, res) => {
  try {
    // If video file is uploaded, use the saved file path
    let videoUrl = req.body.videoUrl;
    let fileSize = req.body.fileSize ? parseInt(req.body.fileSize) : 0;

    // Handle files from multer.fields() - can have both video and thumbnail
    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        // Video file was uploaded
        videoUrl = `/uploads/${req.files.video[0].filename}`;
        fileSize = req.files.video[0].size;
      }
      
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        // Thumbnail file was uploaded
        req.body.thumbnailUrl = `/uploads/${req.files.thumbnail[0].filename}`;
      }
    } else if (req.file) {
      // Backward compatibility: single file upload
      videoUrl = `/uploads/${req.file.filename}`;
      fileSize = req.file.size;
    }

    // Use thumbnail from files or body
    let thumbnailUrl = req.body.thumbnailUrl || '';

    // Validate required fields
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Video file or video URL is required',
      });
    }

    const videoData = {
      title: req.body.title,
      description: req.body.description || '',
      subjectId: req.body.subjectId,
      class: req.body.class,
      chapter: req.body.chapter || '',
      topic: req.body.topic || '',
      videoUrl: videoUrl,
      thumbnailUrl: thumbnailUrl || req.body.thumbnailUrl || '',
      duration: req.body.duration || '',
      fileSize: fileSize,
      isDownloadable: req.body.isDownloadable === 'true' || req.body.isDownloadable === true,
      createdBy: req.superAdmin._id,
    };

    const video = await Video.create(videoData);

    // Update subject video count
    await Subject.findByIdAndUpdate(video.subjectId, {
      $inc: { videoCount: 1 },
    });

    res.status(201).json({
      success: true,
      data: video,
      message: req.file ? 'Video uploaded and saved to local storage' : 'Video created with external URL',
    });
  } catch (error) {
    // If file was uploaded but video creation failed, delete the file
    if (req.file) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// @desc    Update video (Super Admin)
// @route   PUT /api/videos/:id
// @access  Private (Super Admin)
exports.updateVideo = async (req, res) => {
  try {
    let video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    video = await Video.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Download video (School Admin)
// @route   GET /api/videos/:id/download
// @access  Private (School)
exports.downloadVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('subjectId', 'name');

    if (!video || !video.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    if (!video.isDownloadable) {
      return res.status(403).json({
        success: false,
        error: 'Video is not available for download',
      });
    }

    // Check if school has download quota
    const School = require('../models/School');
    const school = await School.findById(req.school._id);
    
    if (school.downloadQuota.used >= school.downloadQuota.allowed) {
      return res.status(403).json({
        success: false,
        error: 'Download quota exceeded. Please request additional access.',
      });
    }

    // Get video file path
    const videoPath = path.join(__dirname, '..', video.videoUrl);
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        error: 'Video file not found on server',
      });
    }

    // Track download
    await UsageReport.create({
      schoolId: req.school._id,
      subjectId: video.subjectId._id,
      videoId: video._id,
      action: 'download',
    });

    // Increment download quota usage
    school.downloadQuota.used += 1;
    await school.save();

    // Set headers for file download
    const filename = `${video.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');
    
    // Stream the file
    const fileStream = fs.createReadStream(videoPath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming video:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error streaming video file',
        });
      }
    });
  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Delete video (Super Admin)
// @route   DELETE /api/videos/:id
// @access  Private (Super Admin)
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    // Delete file from local storage if it exists
    if (video.videoUrl && video.videoUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', video.videoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete thumbnail if it exists
    if (video.thumbnailUrl && video.thumbnailUrl.startsWith('/uploads/')) {
      const thumbPath = path.join(__dirname, '..', video.thumbnailUrl);
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    }

    // Soft delete
    video.isActive = false;
    await video.save();

    // Update subject video count
    await Subject.findByIdAndUpdate(video.subjectId, {
      $inc: { videoCount: -1 },
    });

    res.status(200).json({
      success: true,
      data: {},
      message: 'Video deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Get recent videos
// @route   GET /api/videos/recent
// @access  Private (School)
exports.getRecentVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isActive: true })
      .populate('subjectId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};


