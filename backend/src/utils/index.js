/**
 * Utils Registry
 * Export tất cả utilities từ một nơi
 * Dễ dàng import và sử dụng
 */

const logger = require('./logger');
const fileUtils = require('./fileUtils');

// Email module - handle gracefully if nodemailer has issues
let email = {};
try {
  email = require('./email');
} catch (err) {
  logger.warn('Email module not loaded:', err.message);
}

module.exports = {
  // Logger
  logger,

  // Email (may be empty if module failed to load)
  email,

  // File utilities
  ...fileUtils,

  // Helper functions
  formatBytes: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  generateRandomString: (length = 16) => {
    return require('crypto').randomBytes(length).toString('hex');
  },
};

/*
 * Usage:
 *
 * const { logger, email, formatBytes } = require('./src/utils');
 * const { cleanupOrphans } = require('./src/utils');
 *
 * // Or import everything
 * const utils = require('./src/utils');
 * utils.logger.info('Message');
 */