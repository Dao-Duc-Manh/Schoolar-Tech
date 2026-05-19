/**
 * Scholar Tech Backend
 * Main entry point for all modules
 *
 * Import pattern:
 * const { routes, middleware, controllers, utils, config, models } = require('./src');
 */

// Routes
const routes = require('./routes');
const routeRegistry = require('./routes');

// Middleware
const middleware = require('./middleware');

// Controllers
const controllers = require('./controllers');

// Utils
const utils = require('./utils');

// Config
const config = require('./config');

// Models
const models = require('./models');

// Socket
const socket = require('./socket');

module.exports = {
  // Routes
  routes,
  routeRegistry,

  // Middleware
  middleware,

  // Controllers
  controllers,

  // Utils
  utils,

  // Config
  config,

  // Models
  models,

  // Socket
  socket,
};

/*
 * Usage Examples:
 *
 * // Import everything
 * const db = require('./src');
 * db.routes.use('/auth', authRoutes);
 * db.middleware.applySecurityMiddleware(app);
 *
 * // Or import specific module
 * const { routes, middleware, controllers } = require('./src');
 *
 * // Or import directly
 * const authRoutes = require('./src/routes/auth');
 * const { authMiddleware, authorize } = require('./src/middleware');
 * const { login } = require('./src/controllers/authController');
 */