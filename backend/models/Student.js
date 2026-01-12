const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true,
    uppercase: true
  },
  enquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry'
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  course: {
    type: String,
    required: [true, 'Course is required']
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  guardianName: {
    type: String,
    trim: true
  },
  guardianPhone: {
    type: String
  },
  guardianRelation: {
    type: String,
    enum: ['Father', 'Mother', 'Guardian', 'Other', '']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Graduated', 'Dropped'],
    default: 'Active'
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// IMPROVED: Auto-generate student ID before validation
studentSchema.pre('validate', async function(next) {
  if (this.isNew && !this.studentId) {
    try {
      // Get current year (last 2 digits)
      const year = new Date().getFullYear().toString().substr(-2);
      
      // Find the highest existing student ID for this year
      const lastStudent = await this.constructor
        .findOne({ studentId: new RegExp(`^STU${year}`) })
        .sort({ studentId: -1 })
        .select('studentId')
        .lean();
      
      let nextNumber = 1;
      
      if (lastStudent && lastStudent.studentId) {
        // Extract the number part (last 4 digits)
        const lastNumber = parseInt(lastStudent.studentId.substr(-4));
        nextNumber = lastNumber + 1;
      }
      
      // Generate new student ID
      this.studentId = `STU${year}${String(nextNumber).padStart(4, '0')}`;
      
      console.log('✅ Generated Student ID:', this.studentId);
      next();
    } catch (error) {
      console.error('Error generating student ID:', error);
      next(error);
    }
  } else {
    next();
  }
});

// Indexes for faster queries
studentSchema.index({ studentId: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ course: 1, year: 1 });

module.exports = mongoose.model('Student', studentSchema);