/**
 * Express App Setup
 * Cấu hình và khởi tạo Express app
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const appConfig = require('./app');
const errorHandler = require('../middleware/errorHandler');

/**
 * Tạo và cấu hình Express app
 */
function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Rate limiting
  app.use(rateLimit({
    windowMs: appConfig.rateLimit.windowMs,
    max: appConfig.rateLimit.max,
    message: { success: false, message: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Compression
  app.use(compression());

  // CORS
  app.use(cors(appConfig.cors));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Error handlers
  const { notFoundHandler } = require('../middleware/errorHandler');
  app.use(notFoundHandler);
  app.use(errorHandler.errorHandler);

  return app;
}

module.exports = { createApp, appConfig };