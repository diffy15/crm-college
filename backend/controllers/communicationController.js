const Communication = require('../models/Communication');
const Enquiry = require('../models/Enquiry');
const Student = require('../models/Student');

// @desc    Create communication log
// @route   POST /api/communications
// @access  Private
exports.createCommunication = async (req, res) => {
  try {
    const { enquiryId, studentId, communicationType, subject, notes, followUpRequired, followUpDate } = req.body;

    // Validate at least one ID is provided
    if (!enquiryId && !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Either enquiryId or studentId is required'
      });
    }

    // Prepare communication data
    const communicationData = {
      ...req.body,
      recordedBy: req.admin._id,
      recordedByName: req.admin.fullName
    };

    const communication = await Communication.create(communicationData);

    res.status(201).json({
      success: true,
      message: 'Communication logged successfully',
      data: communication
    });
  } catch (error) {
    console.error('Create communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating communication',
      error: error.message
    });
  }
};

// @desc    Get all communications
// @route   GET /api/communications
// @access  Private
exports.getAllCommunications = async (req, res) => {
  try {
    const { 
      enquiryId,
      studentId,
      communicationType,
      followUpRequired,
      page = 1,
      limit = 20,
      sortBy = 'communicationDate',
      order = 'desc'
    } = req.query;

    const query = {};

    if (enquiryId) query.enquiryId = enquiryId;
    if (studentId) query.studentId = studentId;
    if (communicationType) query.communicationType = communicationType;
    if (followUpRequired !== undefined) query.followUpRequired = followUpRequired === 'true';

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const communications = await Communication.find(query)
      .populate('enquiryId', 'studentName email phone')
      .populate('studentId', 'fullName studentId email phone')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Communication.countDocuments(query);

    res.json({
      success: true,
      data: communications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get communications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching communications',
      error: error.message
    });
  }
};

// @desc    Get communications by enquiry
// @route   GET /api/communications/enquiry/:id
// @access  Private
exports.getByEnquiry = async (req, res) => {
  try {
    const communications = await Communication.find({ enquiryId: req.params.id })
      .populate('recordedBy', 'fullName')
      .sort({ communicationDate: -1 });

    res.json({
      success: true,
      data: communications
    });
  } catch (error) {
    console.error('Get enquiry communications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching communications',
      error: error.message
    });
  }
};

// @desc    Get communications by student
// @route   GET /api/communications/student/:id
// @access  Private
exports.getByStudent = async (req, res) => {
  try {
    const communications = await Communication.find({ studentId: req.params.id })
      .populate('recordedBy', 'fullName')
      .sort({ communicationDate: -1 });

    res.json({
      success: true,
      data: communications
    });
  } catch (error) {
    console.error('Get student communications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching communications',
      error: error.message
    });
  }
};

// @desc    Get today's follow-ups
// @route   GET /api/communications/followups/today
// @access  Private
exports.getTodaysFollowups = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const followups = await Communication.find({
      followUpRequired: true,
      followUpCompleted: false,
      followUpDate: {
        $gte: today,
        $lt: tomorrow
      }
    })
      .populate('enquiryId', 'studentName email phone status')
      .populate('studentId', 'fullName studentId email phone')
      .sort({ followUpDate: 1 });

    res.json({
      success: true,
      data: followups
    });
  } catch (error) {
    console.error('Get today followups error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching follow-ups',
      error: error.message
    });
  }
};

// @desc    Update communication
// @route   PUT /api/communications/:id
// @access  Private
exports.updateCommunication = async (req, res) => {
  try {
    const communication = await Communication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }

    res.json({
      success: true,
      message: 'Communication updated successfully',
      data: communication
    });
  } catch (error) {
    console.error('Update communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating communication',
      error: error.message
    });
  }
};

// @desc    Mark follow-up as completed
// @route   PATCH /api/communications/:id/complete
// @access  Private
exports.markFollowupComplete = async (req, res) => {
  try {
    const communication = await Communication.findByIdAndUpdate(
      req.params.id,
      { followUpCompleted: true },
      { new: true }
    );

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }

    res.json({
      success: true,
      message: 'Follow-up marked as completed',
      data: communication
    });
  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating communication',
      error: error.message
    });
  }
};

// @desc    Delete communication
// @route   DELETE /api/communications/:id
// @access  Private
exports.deleteCommunication = async (req, res) => {
  try {
    const communication = await Communication.findByIdAndDelete(req.params.id);

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }

    res.json({
      success: true,
      message: 'Communication deleted successfully'
    });
  } catch (error) {
    console.error('Delete communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting communication',
      error: error.message
    });
  }
};