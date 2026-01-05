const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subscription: {
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  downloadQuota: {
    allowed: {
      type: Number,
      default: 50,
    },
    used: {
      type: Number,
      default: 0,
    },
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

SchoolSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('School', SchoolSchema);



