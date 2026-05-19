const express = require('express');
const studentController = require('../controllers/studentController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Enroll student (admin/teacher only)
router.post('/enroll', authorize('admin', 'teacher'), studentController.enrollStudent);

// Get students in class
router.get('/class/:classId', studentController.getClassStudents);

// Get student profile
router.get('/:studentId', studentController.getStudentProfile);

// Update student
router.put('/:studentId', authorize('admin', 'teacher'), studentController.updateStudent);

module.exports = router;
