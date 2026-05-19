/**
 * Controllers Registry
 * Export tất cả controllers từ một nơi
 * Dễ dàng import và sử dụng
 */

const authController = require('./authController');
const documentController = require('./documentController');
const chatController = require('./chatController');
// const classController = require('./classController');
// const gradeController = require('./gradeController');
// const studentController = require('./studentController');

module.exports = {
  // Auth
  authController,

  // Documents
  documentController,

  // Chat
  chatController,

  // Future controllers (commented out)
  // classController,
  // gradeController,
  // studentController,
};

/*
 * Usage:
 *
 * const { authController, documentController } = require('./src/controllers');
 *
 * // Or import specific controller
 * const authController = require('./src/controllers/authController');
 */