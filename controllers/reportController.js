const UsageReport = require('../models/UsageReport');
const Video = require('../models/Video');
const Subject = require('../models/Subject');

// @desc    Get usage reports (School Admin)
// @route   GET /api/reports
// @access  Private (School)
exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate, subjectId } = req.query;
    const schoolId = req.school._id;
    
    let query = { schoolId };
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    if (subjectId) {
      query.subjectId = subjectId;
    }

    const reports = await UsageReport.find(query)
      .populate('subjectId', 'name')
      .populate('videoId', 'title')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Get subject-wise usage stats
// @route   GET /api/reports/subject-wise
// @access  Private (School)
exports.getSubjectWiseUsage = async (req, res) => {
  try {
    const schoolId = req.school._id;
    const { startDate, endDate } = req.query;
    
    let matchQuery = { schoolId, action: 'play' };
    
    if (startDate && endDate) {
      matchQuery.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const usage = await UsageReport.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$subjectId',
          videosWatched: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
      {
        $project: {
          subjectName: '$subject.name',
          videosWatched: 1,
          totalDuration: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Track usage
// @route   POST /api/reports/track
// @access  Private (School)
exports.trackUsage = async (req, res) => {
  try {
    const { subjectId, videoId, action, duration } = req.body;
    
    const report = await UsageReport.create({
      schoolId: req.school._id,
      subjectId,
      videoId,
      action,
      duration,
    });

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};



