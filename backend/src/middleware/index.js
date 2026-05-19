/**
 * Middleware Registry
 * Export tất cả middleware từ một nơi
 * Dễ dàng import và sử dụng
 */

const authMiddleware = require('./auth');
const securityMiddleware = require('./security');
const errorHandlers = require('./errorHandler');
const corsMiddleware = require('./cors');

// Security middleware array (for applying to Express app)
const securityMiddlewareArray = require('./security');

// Export individual middleware
module.exports = {
  // Auth middleware
  authMiddleware: authMiddleware.authMiddleware || authMiddleware,
  authorize: authMiddleware.authorize,
  isAuthenticated: authMiddleware.isAuthenticated || authMiddleware,

  // Security middleware
  securityMiddleware: securityMiddleware,
  securityMiddlewareArray: Array.isArray(securityMiddlewareArray) ? securityMiddlewareArray : [securityMiddleware],

  // Error handlers
  errorHandler: errorHandlers.errorHandler,
  notFoundHandler: errorHandlers.notFoundHandler,
  asyncHandler: errorHandlers.asyncHandler,

  // CORS
  corsMiddleware: corsMiddleware,
};

/**
 * Helper function to apply all security middleware to an Express app
 * @param {Express app} app - Express application instance
 */
module.exports.applySecurityMiddleware = (app) => {
  const security = module.exports.securityMiddlewareArray;
  if (Array.isArray(security)) {
    security.forEach(mw => {
      if (typeof mw === 'function') {
        app.use(mw);
      }
    });
  }
};

/**
 * Helper function to apply all error handlers to an Express app
 * @param {Express app} app - Express application instance
 */
module.exports.applyErrorHandlers = (app) => {
  app.use(module.exports.notFoundHandler);
  app.use(module.exports.errorHandler);
};

/*
 * Usage:
 *
 * const { authMiddleware, authorize, errorHandler, notFoundHandler } = require('./src/middleware');
 *
 * // Or use helper functions
 * const middleware = require('./src/middleware');
 * middleware.applySecurityMiddleware(app);
 * middleware.applyErrorHandlers(app);
 */