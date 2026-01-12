const Enquiry = require('../models/Enquiry');
const Student = require('../models/Student');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Total counts
    const totalEnquiries = await Enquiry.countDocuments();
    const totalStudents = await Student.countDocuments();

    // Enquiry status breakdown
    const enquiryStats = await Enquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object
    const enquiryStatusObj = {};
    enquiryStats.forEach(stat => {
      enquiryStatusObj[stat._id] = stat.count;
    });

    // Student status breakdown
    const studentStats = await Student.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object
    const studentStatusObj = {};
    studentStats.forEach(stat => {
      studentStatusObj[stat._id] = stat.count;
    });

    // Recent enquiries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEnquiries = await Enquiry.countDocuments({
      enquiryDate: { $gte: sevenDaysAgo }
    });

    // Recent admissions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAdmissions = await Student.countDocuments({
      admissionDate: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalEnquiries,
          totalStudents,
          recentEnquiries,
          recentAdmissions
        },
        enquiries: {
          total: totalEnquiries,
          new: enquiryStatusObj.New || 0,
          contacted: enquiryStatusObj.Contacted || 0,
          admitted: enquiryStatusObj.Admitted || 0,
          rejected: enquiryStatusObj.Rejected || 0
        },
        students: {
          total: totalStudents,
          active: studentStatusObj.Active || 0,
          inactive: studentStatusObj.Inactive || 0,
          graduated: studentStatusObj.Graduated || 0,
          dropped: studentStatusObj.Dropped || 0
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent enquiries
    const recentEnquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('studentName courseApplied status enquiryDate');

    // Get recent students
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName studentId course admissionDate');

    res.json({
      success: true,
      data: {
        recentEnquiries,
        recentStudents
      }
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};

// @desc    Get course-wise data
// @route   GET /api/dashboard/course-wise-data
// @access  Private
exports.getCourseWiseData = async (req, res) => {
  try {
    // Enquiries by course
    const enquiriesByCourse = await Enquiry.aggregate([
      {
        $group: {
          _id: '$courseApplied',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Students by course
    const studentsByCourse = await Student.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Students by year
    const studentsByYear = await Student.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        enquiriesByCourse,
        studentsByCourse,
        studentsByYear
      }
    });
  } catch (error) {
    console.error('Get course-wise data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course-wise data',
      error: error.message
    });
  }
};