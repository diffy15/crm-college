const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentCode: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  courseName: {
    type: String,
    required: true
  },
  
  // Fee details
  feeType: {
    type: String,
    enum: ['Admission Fee', 'Yearly Fee', 'Semester Fee', 'Exam Fee', 'Caution Deposit', 'Other'],
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 12
  },
  
  // Amount details
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingAmount: {
    type: Number,
    default: 0
  },
  
  // Payment details
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque', 'DD', 'Other'],
    required: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  receiptNumber: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  
  // Payment status
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Partial', 'Pending', 'Overdue'],
    default: 'Paid'
  },
  dueDate: {
    type: Date
  },
  
  // Additional info
  paidBy: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  
  // Who recorded
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  recordedByName: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate pending amount before saving
feeSchema.pre('save', function(next) {
  this.pendingAmount = this.totalAmount - this.paidAmount;
  
  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'Paid';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'Partial';
  } else if (this.dueDate && this.dueDate < new Date()) {
    this.paymentStatus = 'Overdue';
  } else {
    this.paymentStatus = 'Pending';
  }
  
  next();
});

// Auto-generate receipt number
feeSchema.pre('validate', async function(next) {
  if (this.isNew && !this.receiptNumber) {
    const year = new Date().getFullYear().toString().substr(-2);
    const count = await this.constructor.countDocuments();
    this.receiptNumber = `RCP${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes
feeSchema.index({ studentId: 1 });
feeSchema.index({ receiptNumber: 1 });
feeSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Fee', feeSchema);