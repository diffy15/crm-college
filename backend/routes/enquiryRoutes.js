const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Routes
router.post('/', enquiryController.createEnquiry);
router.get('/', enquiryController.getAllEnquiries);
router.get('/:id', enquiryController.getEnquiryById);
router.get('/:id/for-conversion', enquiryController.getEnquiryForConversion); // NEW!
router.put('/:id', enquiryController.updateEnquiry);
router.delete('/:id', enquiryController.deleteEnquiry);
router.patch('/:id/status', enquiryController.updateEnquiryStatus);

module.exports = router;