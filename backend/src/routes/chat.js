const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { getMessages, sendMessage } = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

// GET /api/chat/:classId/messages?page=1&limit=50
router.get('/:classId/messages', authMiddleware, getMessages);

// POST /api/chat/:classId/messages
router.post('/:classId/messages', authMiddleware, sendMessage);

module.exports = router;
