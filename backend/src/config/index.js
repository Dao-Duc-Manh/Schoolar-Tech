/**
 * Config Registry
 * Export tất cả config từ một nơi
 * Dễ dàng import và sử dụng
 */

const database = require('./database');
const app = require('./app');
const setup = require('./setup');

// Load environment variables
require('dotenv').config();

module.exports = {
  // Database
  database,
  sequelize: database,

  // App config
  app,

  // Setup functions
  ...setup,

  // Environment variables (common ones)
  env: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // Database
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: process.env.DB_PORT || 5432,
    dbName: process.env.DB_NAME || 'scholar_tech_db',
    dbUser: process.env.DB_USER || 'postgres',

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || '*',

    // Upload
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
};

/*
 * Usage:
 *
 * const { sequelize, app, env } = require('./src/config');
 *
 * // Or import specific config
 * const database = require('./src/config/database');
 */