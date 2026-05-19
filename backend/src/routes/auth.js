const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Debug endpoint - check server and seed users
router.get('/debug', (req, res) => {
  const authCtrl = require('../controllers/authController');
  // Get users directly from module
  res.json({
    success: true,
    message: 'Auth API is working',
    endpoint: '/api/auth/debug'
  });
});

// Health check
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong', time: new Date().toISOString() });
});

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
