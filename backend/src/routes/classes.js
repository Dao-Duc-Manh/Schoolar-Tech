const express = require('express');
const classController = require('../controllers/classController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create class (teachers only)
router.post('/', authorize('teacher', 'admin'), classController.createClass);

// Get all classes
router.get('/', classController.getAllClasses);

// Get class by ID
router.get('/:id', classController.getClassById);

// Update class (teacher/admin only)
router.put('/:id', authorize('teacher', 'admin'), classController.updateClass);

// Delete class (teacher/admin only)
router.delete('/:id', authorize('teacher', 'admin'), classController.deleteClass);

module.exports = router;
