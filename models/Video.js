const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required'],
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
  },
  chapter: {
    type: String,
    trim: true,
  },
  topic: {
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL or file is required'],
  },
  thumbnailUrl: {
    type: String,
  },
  duration: {
    type: String,
  },
  fileSize: {
    type: Number, // in bytes
  },
  isDownloadable: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

VideoSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Video', VideoSchema);


