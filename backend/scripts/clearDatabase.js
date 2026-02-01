/**
 * SUVIDHA 2026 - Database Cleanup Script
 * 
 * This script clears all data from the database for fresh seeding
 */

const mongoose = require('mongoose');
const { config } = require('dotenv');

// Load environment variables
config();

// Import models
const User = require('../models/User.js');
const Department = require('../models/Department.js');
const SubDepartment = require('../models/SubDepartment.js');
const Complaint = require('../models/Complaint.js');
const AuditLog = require('../models/AuditLog.js');

/**
 * Connect to MongoDB database
 */
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for cleanup');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Clear all collections
 */
const clearDatabase = async () => {
  try {
    console.log('🧹 Clearing database...');
    
    // Clear all collections
    await User.deleteMany({});
    console.log('   ✅ Cleared Users collection');
    
    await Department.deleteMany({});
    console.log('   ✅ Cleared Departments collection');
    
    await SubDepartment.deleteMany({});
    console.log('   ✅ Cleared SubDepartments collection');
    
    await Complaint.deleteMany({});
    console.log('   ✅ Cleared Complaints collection');
    
    await AuditLog.deleteMany({});
    console.log('   ✅ Cleared AuditLogs collection');
    
    console.log('🎉 Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
};

/**
 * Main cleanup function
 */
const main = async () => {
  try {
    console.log('🚀 Starting Database Cleanup...\n');
    
    // Connect to database
    await connectDatabase();
    
    // Clear database
    await clearDatabase();
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

// Run cleanup if called directly
if (require.main === module) {
  main();
}

module.exports = { clearDatabase };