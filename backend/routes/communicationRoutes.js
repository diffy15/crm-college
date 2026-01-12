const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Routes
router.post('/', communicationController.createCommunication);
router.get('/', communicationController.getAllCommunications);
router.get('/enquiry/:id', communicationController.getByEnquiry);
router.get('/student/:id', communicationController.getByStudent);
router.get('/followups/today', communicationController.getTodaysFollowups);
router.put('/:id', communicationController.updateCommunication);
router.patch('/:id/complete', communicationController.markFollowupComplete);
router.delete('/:id', communicationController.deleteCommunication);

module.exports = router;