/**
 * SUVIDHA 2026 - Serverless Entry Point
 * 
 * This file serves as the entry point for both:
 * - Local development (via server.js)
 * - Vercel serverless deployment
 * 
 * It automatically detects the environment and adapts accordingly.
 */

const app = require('./app');
const connectDB = require('./config/database');
const { initializeSystem } = require('./bootstrap/superAdminBootstrap');

// Global connection cache for serverless
let cachedConnection = null;

/**
 * Initialize database connection with caching for serverless
 */
const initializeDatabase = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    cachedConnection = await connectDB();
    
    // Initialize system (Super Admin, etc.) only once
    if (process.env.NODE_ENV === 'production' || !global.systemInitialized) {
      await initializeSystem();
      global.systemInitialized = true;
    }
    
    return cachedConnection;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

/**
 * Serverless handler for Vercel
 */
const handler = async (req, res) => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Export for Vercel
module.exports = handler;

// For local development, start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  
  const startServer = async () => {
    try {
      // Initialize database
      await initializeDatabase();
      
      // Start HTTP server
      const server = app.listen(PORT, () => {
        console.log(`🚀 SUVIDHA 2026 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api`);
        console.log(`🏛️  Government System Status: OPERATIONAL`);
        console.log('');
        console.log('🔐 Super Admin Login:');
        console.log(`   POST /api/auth/admin/login`);
        console.log(`   Body: { "email": "admin@suvidha.gov.in", "password": "123456" }`);
        console.log('');
      });

      // Graceful shutdown handlers
      const gracefulShutdown = (signal) => {
        console.log(`${signal} signal received: closing HTTP server`);
        server.close(() => {
          console.log('HTTP server closed');
          process.exit(0);
        });
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}