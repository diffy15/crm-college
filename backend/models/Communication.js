const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  // Link to enquiry or student
  enquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  
  // Communication details
  communicationType: {
    type: String,
    enum: ['Phone Call', 'Email', 'SMS', 'WhatsApp', 'In-person Meeting', 'Walk-in Visit', 'Other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    required: true,
    trim: true
  },
  communicationDate: {
    type: Date,
    default: Date.now
  },
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpCompleted: {
    type: Boolean,
    default: false
  },
  
  // Who recorded this
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  recordedByName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
communicationSchema.index({ enquiryId: 1 });
communicationSchema.index({ studentId: 1 });
communicationSchema.index({ communicationDate: -1 });
communicationSchema.index({ followUpDate: 1 });

module.exports = mongoose.model('Communication', communicationSchema);