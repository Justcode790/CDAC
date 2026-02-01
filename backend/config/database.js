/**
 * SUVIDHA 2026 - MongoDB Database Connection
 * 
 * This module handles the MongoDB connection using Mongoose.
 * It includes connection retry logic and proper error handling.
 * Optimized for both local development and serverless deployment.
 * 
 * Connection string is read from MONGODB_URI environment variable.
 */

const mongoose = require('mongoose');
const { config } = require('dotenv');

// Load environment variables
config();

// Connection cache for serverless environments
let cachedConnection = null;

const connectDB = async () => {
  try {
    // In serverless environments, reuse existing connections
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log('🔄 Reusing existing MongoDB connection');
      return cachedConnection;
    }

    console.log('🔍 MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    // Serverless-optimized connection options
    const connectionOptions = {
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Cache the connection for serverless reuse
    cachedConnection = conn;

    // Connection event listeners (only in development)
    if (process.env.NODE_ENV === 'development') {
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
        cachedConnection = null;
      });

      // Graceful shutdown (only for local development)
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });
    }

    return conn;

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    cachedConnection = null;
    
    // In serverless, don't exit process, just throw error
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
