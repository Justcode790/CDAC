/**
 * SUVIDHA 2026 - Express Application Configuration
 * 
 * This file configures the Express application with:
 * - Security middleware (Helmet, CORS)
 * - Request parsing (JSON, URL-encoded)
 * - Logging (Morgan)
 * - Rate limiting
 * - API routes
 * - Error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { config } = require('dotenv');

// Load environment variables
config();

const app = express();

// Security Middleware
app.use(helmet()); // Sets various HTTP headers for security

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URL_WWW,
        // Add your production domains here
        'https://your-app.netlify.app',
        'https://your-domain.com',
        'https://www.your-domain.com'
      ].filter(Boolean) // Remove undefined values
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    // Custom headers from frontend
    'X-Client-Environment',
    'X-Client-Version'
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.get('origin'));
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers,X-Client-Environment,X-Client-Version');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

// CORS debugging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`CORS: ${req.method} ${req.path} from origin: ${req.get('origin')}`);
    if (req.method === 'OPTIONS') {
      console.log('CORS: Preflight request detected');
      console.log('CORS: Request headers:', req.get('Access-Control-Request-Headers'));
    }
    next();
  });
}

// Rate Limiting (more lenient in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More requests in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SUVIDHA 2026 API is running',
    timestamp: new Date().toISOString()
  });
});

// API Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'SUVIDHA 2026 API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.get('origin'),
      userAgent: req.get('user-agent')
    }
  });
});

// CORS Test Route (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/cors-test', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'CORS is working correctly',
      origin: req.get('origin'),
      timestamp: new Date().toISOString()
    });
  });
}

// API Routes
const authRoutes = require('./routes/authRoutes.js');
const departmentRoutes = require('./routes/departmentRoutes.js');
const subDepartmentRoutes = require('./routes/subDepartmentRoutes.js');
const officerRoutes = require('./routes/officerRoutes.js');
const complaintRoutes = require('./routes/complaintRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subdepartments', subDepartmentRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
