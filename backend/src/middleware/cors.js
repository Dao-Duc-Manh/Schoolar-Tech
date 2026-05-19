/**
 * Custom CORS Middleware
 * Hỗ trợ nhiều origins và credentials
 */

const cors = require('cors');
require('dotenv').config();

// Parse allowed origins from environment
function getAllowedOrigins() {
  const origins = [];

  // Add CORS_ORIGIN if set (supports multiple comma-separated)
  if (process.env.CORS_ORIGIN) {
    origins.push(...process.env.CORS_ORIGIN.split(',').map(o => o.trim()));
  }

  // Add FRONTEND_URL if set
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  // Add default development origins
  if (process.env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:5173',
      'http://localhost:5500',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5500'
    );
  }

  // Remove duplicates
  return [...new Set(origins.filter(Boolean))];
}

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

module.exports = cors(corsOptions);