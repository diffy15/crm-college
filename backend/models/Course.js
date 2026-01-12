const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    unique: true,
    trim: true
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  duration: {
    years: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    },
    semesters: {
      type: Number,
      required: true,
      min: 2,
      max: 12
    }
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  
  // Fee structure
  feeStructure: {
    totalFees: {
      type: Number,
      required: true,
      min: 0
    },
    admissionFee: {
      type: Number,
      default: 5000
    },
    cautionDeposit: {
      type: Number,
      default: 10000
    },
    yearlyFee: {
      type: Number,
      required: true
    },
    examFeePerSemester: {
      type: Number,
      default: 2000
    }
  },
  
  // Seat availability
  seats: {
    total: {
      type: Number,
      required: true,
      min: 0
    },
    filled: {
      type: Number,
      default: 0,
      min: 0
    },
    available: {
      type: Number,
      default: 0
    }
  },
  
  // Course details
  description: {
    type: String,
    trim: true
  },
  eligibility: {
    type: String,
    trim: true
  },
  facilities: [String],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate available seats before saving
courseSchema.pre('save', function(next) {
  this.seats.available = this.seats.total - this.seats.filled;
  next();
});

// Indexes
courseSchema.index({ courseName: 1 });
courseSchema.index({ courseCode: 1 });

module.exports = mongoose.model('Course', courseSchema);