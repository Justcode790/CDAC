/**
 * SUVIDHA 2026 - Main Server Entry Point
 * 
 * This is the entry point for the Express server.
 * It initializes the Express app, creates Super Admin, and starts the HTTP server.
 * 
 * Production-ready with error handling and graceful shutdown.
 * Government-grade bootstrap system ensures root authority exists.
 */

const app = require('./app.js');
const connectDB = require('./config/database.js');
const { initializeSystem } = require('./bootstrap/superAdminBootstrap.js');
const { config } = require('dotenv');

// Load environment variables
config();

const PORT = process.env.PORT || 5000;

/**
 * Initialize the government system with proper startup sequence
 */
const startServer = async () => {
  try {
    // Step 1: Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Step 2: Initialize Super Admin Bootstrap System
    console.log('');
    console.log('🏛️  SUVIDHA 2026 - Government System Bootstrap');
    console.log('================================================');
    
    const bootstrapResult = await initializeSystem();
    
    if (!bootstrapResult.success) {
      throw new Error('Super Admin bootstrap failed');
    }
    
    console.log('================================================');
    console.log('');
    
    // Step 3: Start HTTP server
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 SUVIDHA 2026 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🏛️  Government System Status: OPERATIONAL`);
      console.log(`👑 Super Admin: ${bootstrapResult.superAdmin.email}`);
      console.log('');
      console.log('🔐 Super Admin Login:');
      console.log(`   POST /api/auth/admin/login`);
      console.log(`   Body: { "email": "${bootstrapResult.superAdmin.email}", "password": "[YOUR_PASSWORD]" }`);
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
    console.error('❌ Failed to start SUVIDHA 2026 Government System');
    console.error('Error:', error.message);
    
    if (error.code === 'MISSING_ENV_VARS') {
      console.error('');
      console.error('🔧 To fix this issue:');
      console.error('1. Create or update your .env file');
      console.error('2. Add the required environment variables');
      console.error('3. Restart the server');
      console.error('');
    }
    
    process.exit(1);
  }
};

// Start the server
startServer();
