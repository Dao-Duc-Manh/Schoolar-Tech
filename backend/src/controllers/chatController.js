const Message = require('../models/Message');
const db = require('../config/database');
const logger = require('../utils/logger');

// Get messages for class/room (paginated)
const getMessages = async (req, res) => {
  try {
    const { classId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
      where: { classId },
include: [
        { model: db.User, as: 'user', attributes: ['id', 'fullName', 'role'] }
      ],
      order: [['timestamp', 'DESC']],
      limit,
      offset,
      logging: false
    });

    res.json({
      success: true,
      data: rows.reverse(), // newest last
      pagination: { page, limit, count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    logger.error('Get messages error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Send message (for HTTP fallback or history)
const sendMessage = async (req, res) => {
  try {
    const { classId } = req.params;
    const { content } = req.body;
const userId = req.user.id;

    if (!content || content.trim().length < 1 || content.length > 1000) {
      return res.status(400).json({ success: false, message: 'Invalid message' });
    }

    const message = await Message.create({
      classId,
      userId,
      content: content.trim()
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    logger.error('Send message error', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

module.exports = { getMessages, sendMessage };
