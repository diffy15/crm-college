// backend/cleanup.js
const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete duplicate STU260002
    const result = await Student.deleteMany({ studentId: "STU260002" });
    console.log(`✅ Deleted ${result.deletedCount} duplicate students`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanup();