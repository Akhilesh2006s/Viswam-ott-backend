const mongoose = require('mongoose');

const UsageReportSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
  },
  action: {
    type: String,
    required: true,
    enum: ['view', 'play', 'download', 'pause', 'resume'],
  },
  duration: {
    type: Number, // in seconds
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
});

module.exports = mongoose.model('UsageReport', UsageReportSchema);



