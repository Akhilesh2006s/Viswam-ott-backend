const Subject = require('../models/Subject');
const Video = require('../models/Video');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
exports.getSubjects = async (req, res) => {
  try {
    console.log('Fetching subjects...');
    console.log('User type:', req.superAdmin ? 'Super Admin' : req.school ? 'School' : 'Unknown');
    
    // Get only active subjects for both super admin and school admin
    // Super admin can manage subjects but we only show active ones in the list
    const query = { isActive: true };
    
    console.log('Query:', query);
    console.log('Is Super Admin:', !!req.superAdmin);
    const subjects = await Subject.find(query).sort({ name: 1 });
    console.log('Found subjects:', subjects.length);
    if (subjects.length > 0) {
      console.log('First subject:', subjects[0].name, 'isActive:', subjects[0].isActive);
    }

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
exports.getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject || !subject.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Get videos by subject
// @route   GET /api/subjects/:id/videos
// @access  Private
exports.getSubjectVideos = async (req, res) => {
  try {
    const { class: classFilter } = req.query;
    
    let query = {
      subjectId: req.params.id,
      isActive: true,
    };
    
    if (classFilter) {
      query.class = classFilter;
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

// @desc    Create subject (Super Admin)
// @route   POST /api/subjects
// @access  Private (Super Admin)
exports.createSubject = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        error: 'Subject name is required',
      });
    }

    if (!req.body.classes || !Array.isArray(req.body.classes) || req.body.classes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one class is required',
      });
    }

    const subjectData = {
      name: req.body.name.trim(),
      description: req.body.description ? req.body.description.trim() : '',
      classes: req.body.classes.filter(cls => cls && cls.trim().length > 0),
      thumbnailUrl: req.body.thumbnailUrl || '',
      createdBy: req.superAdmin._id,
    };

    const subject = await Subject.create(subjectData);

    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully',
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Subject with this name already exists',
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// @desc    Update subject (Super Admin)
// @route   PUT /api/subjects/:id
// @access  Private (Super Admin)
exports.updateSubject = async (req, res) => {
  try {
    let subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found',
      });
    }

    subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Delete subject (Super Admin)
// @route   DELETE /api/subjects/:id
// @access  Private (Super Admin)
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found',
      });
    }

    // Soft delete
    subject.isActive = false;
    await subject.save();

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


