const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const xss = require('xss-clean');
const hpp = require('hpp');

// Security middleware array
const securityMiddleware = [
  // Compression - Improve performance
  compression(),

  // Helmet - Protect HTTP headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }),

  // XSS Protection - Sanitize user input
  xss(),

  // HPP (HTTP Parameter Pollution) protection
  hpp(),

  // Rate Limiting - Prevent brute force attacks
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Strict Rate Limiting for auth endpoints
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth
    message: {
      success: false,
      message: 'Too many login attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Only apply to auth routes
      return !req.path.startsWith('/api/auth');
    },
  }),
];

module.exports = securityMiddleware;