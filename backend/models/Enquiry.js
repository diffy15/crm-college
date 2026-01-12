const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  courseApplied: {
    type: String,
    required: [true, 'Course is required'],
    enum: [
      'B.Tech Computer Science',
      'B.Tech Mechanical',
      'B.Tech Civil',
      'B.Tech Electrical',
      'MBA',
      'MCA',
      'BBA',
      'BCA',
      'B.Com',
      'B.Sc',
      'M.Sc',
      'Other'
    ]
  },
  enquiryDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Admitted', 'Rejected'],
    default: 'New'
  },
  source: {
    type: String,
    enum: ['Walk-in', 'Phone', 'Email', 'Website', 'Referral', 'Social Media'],
    default: 'Walk-in'
  },
  address: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries
enquirySchema.index({ studentName: 1, email: 1, phone: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ courseApplied: 1 });

module.exports = mongoose.model('Enquiry', enquirySchema);