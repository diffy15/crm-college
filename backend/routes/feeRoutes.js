const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Routes
router.post('/', feeController.createFee);
router.get('/', feeController.getAllFees);
router.get('/pending/all', feeController.getPendingFees);
router.get('/stats/dashboard', feeController.getFeeStats);
router.get('/student/:studentId', feeController.getFeesByStudent);
router.get('/:id', feeController.getFeeById);
router.put('/:id', feeController.updateFee);
router.delete('/:id', feeController.deleteFee);

module.exports = router;