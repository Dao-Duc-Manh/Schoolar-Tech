/**
 * App Configuration
 * Tập trung tất cả cấu hình ứng dụng
 */

require('dotenv').config();

module.exports = {
  // Server
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',

  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: '24h',
  },

  // Database
  database: {
    name: process.env.DB_NAME || 'scholar_tech_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
  },

  // Uploads
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: /jpeg|jpg|png|gif|pdf|doc|docx|txt/,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Sentry
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
};