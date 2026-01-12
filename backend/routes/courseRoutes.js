const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Routes
router.post('/', courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/active/list', courseController.getActiveCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);
router.patch('/:id/seats', courseController.updateSeats);

module.exports = router;