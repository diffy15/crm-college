const Fee = require('../models/Fee');
const Student = require('../models/Student');

// @desc    Create fee record
// @route   POST /api/fees
// @access  Private
exports.createFee = async (req, res) => {
  try {
    const { studentId } = req.body;

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Add student details to fee record
    const feeData = {
      ...req.body,
      studentName: student.fullName,
      studentCode: student.studentId,
      courseName: student.course,
      recordedBy: req.admin._id,
      recordedByName: req.admin.fullName
    };

    const fee = await Fee.create(feeData);

    res.status(201).json({
      success: true,
      message: 'Fee record created successfully',
      data: fee
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fee record',
      error: error.message
    });
  }
};

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private
exports.getAllFees = async (req, res) => {
  try {
    const {
      studentId,
      paymentStatus,
      feeType,
      academicYear,
      page = 1,
      limit = 20,
      sortBy = 'paymentDate',
      order = 'desc'
    } = req.query;

    const query = {};

    if (studentId) query.studentId = studentId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (feeType) query.feeType = feeType;
    if (academicYear) query.academicYear = academicYear;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const fees = await Fee.find(query)
      .populate('studentId', 'fullName studentId email phone course')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Fee.countDocuments(query);

    // Calculate totals
    const aggregation = await Fee.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalPending: { $sum: '$pendingAmount' }
        }
      }
    ]);

    const totals = aggregation.length > 0 ? aggregation[0] : {
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0
    };

    res.json({
      success: true,
      data: fees,
      totals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fees',
      error: error.message
    });
  }
};

// @desc    Get fee by ID
// @route   GET /api/fees/:id
// @access  Private
exports.getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('studentId', 'fullName studentId email phone course');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.json({
      success: true,
      data: fee
    });
  } catch (error) {
    console.error('Get fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fee',
      error: error.message
    });
  }
};

// @desc    Get fees by student
// @route   GET /api/fees/student/:studentId
// @access  Private
exports.getFeesByStudent = async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.params.studentId })
      .sort({ paymentDate: -1 });

    // Calculate summary
    const summary = await Fee.aggregate([
      { $match: { studentId: mongoose.Types.ObjectId(req.params.studentId) } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalPending: { $sum: '$pendingAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: fees,
      summary: summary.length > 0 ? summary[0] : {
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0
      }
    });
  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student fees',
      error: error.message
    });
  }
};

// @desc    Update fee
// @route   PUT /api/fees/:id
// @access  Private
exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.json({
      success: true,
      message: 'Fee record updated successfully',
      data: fee
    });
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating fee',
      error: error.message
    });
  }
};

// @desc    Delete fee
// @route   DELETE /api/fees/:id
// @access  Private
exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.json({
      success: true,
      message: 'Fee record deleted successfully'
    });
  } catch (error) {
    console.error('Delete fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fee',
      error: error.message
    });
  }
};

// @desc    Get pending fees
// @route   GET /api/fees/pending/all
// @access  Private
exports.getPendingFees = async (req, res) => {
  try {
    const pendingFees = await Fee.find({
      paymentStatus: { $in: ['Pending', 'Partial', 'Overdue'] }
    })
      .populate('studentId', 'fullName studentId email phone')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: pendingFees
    });
  } catch (error) {
    console.error('Get pending fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending fees',
      error: error.message
    });
  }
};

// @desc    Get fee dashboard stats
// @route   GET /api/fees/stats/dashboard
// @access  Private
exports.getFeeStats = async (req, res) => {
  try {
    // Overall stats
    const stats = await Fee.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paidAmount' },
          totalPending: { $sum: '$pendingAmount' },
          totalExpected: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Status-wise count
    const statusCount = await Fee.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          amount: { $sum: '$pendingAmount' }
        }
      }
    ]);

    // This month collection
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyCollection = await Fee.aggregate([
      {
        $match: {
          paymentDate: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$paidAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || { totalRevenue: 0, totalPending: 0, totalExpected: 0 },
        byStatus: statusCount,
        thisMonth: monthlyCollection[0] || { amount: 0, count: 0 }
      }
    });
  } catch (error) {
    console.error('Get fee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fee statistics',
      error: error.message
    });
  }
};