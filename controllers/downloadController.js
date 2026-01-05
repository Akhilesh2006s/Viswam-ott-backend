const DownloadRequest = require('../models/DownloadRequest');
const School = require('../models/School');
const Video = require('../models/Video');

// @desc    Get download requests (School Admin)
// @route   GET /api/downloads/requests
// @access  Private (School)
exports.getDownloadRequests = async (req, res) => {
  try {
    const requests = await DownloadRequest.find({ schoolId: req.school._id })
      .populate('videoId', 'title subjectId')
      .populate('videoId.subjectId', 'name')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Create download request (School Admin)
// @route   POST /api/downloads/requests
// @access  Private (School)
exports.createDownloadRequest = async (req, res) => {
  try {
    const { videoId } = req.body;
    
    const video = await Video.findById(videoId);
    
    if (!video || !video.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }
    
    if (!video.isDownloadable) {
      return res.status(400).json({
        success: false,
        error: 'Video is not available for download',
      });
    }

    // Check if request already exists
    const existingRequest = await DownloadRequest.findOne({
      schoolId: req.school._id,
      videoId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'Download request already pending',
      });
    }

    const request = await DownloadRequest.create({
      schoolId: req.school._id,
      videoId,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Get all download requests (Super Admin)
// @route   GET /api/admin/downloads/requests
// @access  Private (Super Admin)
exports.getAllDownloadRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const requests = await DownloadRequest.find(query)
      .populate('schoolId', 'name email')
      .populate('videoId', 'title')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Approve/Reject download request (Super Admin)
// @route   PUT /api/admin/downloads/requests/:id
// @access  Private (Super Admin)
exports.updateDownloadRequest = async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const request = await DownloadRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    request.status = status;
    request.reviewedAt = new Date();
    request.reviewedBy = req.superAdmin._id;
    if (reason) {
      request.reason = reason;
    }
    
    await request.save();

    // If approved, update school download quota
    if (status === 'approved') {
      const school = await School.findById(request.schoolId);
      if (school.downloadQuota.used < school.downloadQuota.allowed) {
        school.downloadQuota.used += 1;
        await school.save();
      }
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};



