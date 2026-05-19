/**
 * Route Registry
 * Tập trung tất cả các routes vào một file
 * Dễ dàng quản lý và mở rộng
 */

const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./auth');
const documentRoutes = require('./documents');
// const classRoutes = require('./classes');
// const studentRoutes = require('./students');
// const gradeRoutes = require('./grades');
// const chatRoutes = require('./chat');

// ===========================
// API Routes Configuration
// ===========================

/**
 * Route mapping:
 * /api/auth       - Authentication (login, register, logout)
 * /api/documents  - Document management (upload, download, list)
 * /api/classes    - Class management (coming soon)
 * /api/students   - Student management (coming soon)
 * /api/grades     - Grade management (coming soon)
 * /api/chat       - Real-time chat (coming soon)
 */

// Register routes
const registerRoutes = (app) => {
  // Health check routes are handled in server.js for more control
  // But we can also add them here if needed

  // API Routes - All routes under /api
  router.use('/auth', authRoutes);
  router.use('/documents', documentRoutes);

  // Future routes (uncomment to enable)
  // router.use('/classes', classRoutes);
  // router.use('/students', studentRoutes);
  // router.use('/grades', gradeRoutes);
  // router.use('/chat', chatRoutes);

  return router;
};

// Export both router and register function
module.exports = router;
module.exports.register = registerRoutes;

/*
 * Usage in server.js:
 *
 * const routes = require('./src/routes');
 * app.use('/api', routes);
 *
 * Or use the register function:
 *
 * const routes = require('./src/routes');
 * routes.register(app);
 * app.use('/api', routes);
 */