const express = require('express');
const gradeController = require('../controllers/gradeController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Add grade (teacher/admin only)
router.post('/', authorize('teacher', 'admin'), gradeController.addGrade);

// Get student grades
router.get('/student/:studentId', gradeController.getStudentGrades);

// Update grade (teacher/admin only)
router.put('/:gradeId', authorize('teacher', 'admin'), gradeController.updateGrade);

// Get grade report
router.get('/report/class', gradeController.getGradeReport);

module.exports = router;
