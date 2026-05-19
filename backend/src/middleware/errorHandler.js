/**
 * Error Handling Middleware
 * Supports Sentry for production error tracking
 * Falls back to basic error handling if Sentry not available
 */

let Sentry;
try {
  Sentry = require('@sentry/node');
} catch (e) {
  console.warn('Sentry not installed - error tracking disabled');
}

// Initialize Sentry if available and DSN is set
if (Sentry && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: `scholar-tech@${process.env.npm_package_version || '1.0.0'}`,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
  console.log('✅ Sentry initialized for error tracking');
}

/**
 * Express error handler middleware
 * Captures and reports errors to Sentry
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Capture to Sentry if available
  if (Sentry && process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  // Determine status code
  const status = err.status || err.statusCode || 500;

  // Security: hide error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message;

  // Build response
  const response = {
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  };

  // Add validation errors if applicable
  if (err.name === 'ValidationError') {
    response.error.type = 'validation';
    response.error.details = err.errors;
  }

  // Add specific error types
  if (err.name === 'JsonWebTokenError') {
    response.error.type = 'auth';
    response.error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    response.error.type = 'auth';
    response.error.message = 'Token expired';
  }

  res.status(status).json(response);
};

/**
 * Async handler wrapper to catch errors automatically
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      type: 'notFound',
    },
  });
};

/**
 * 500 handler for uncaught errors
 */
const serverErrorHandler = (err, req, res, next) => {
  console.error('Uncaught error:', err);

  if (Sentry && process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message,
    },
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  serverErrorHandler,
  Sentry,
};