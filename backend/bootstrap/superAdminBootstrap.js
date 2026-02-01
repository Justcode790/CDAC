/**
 * SUVIDHA 2026 - Super Admin Bootstrap System
 * 
 * This module automatically creates a Super Admin user on first server start
 * using environment variables. This ensures there's always a root authority
 * to manage the entire government system.
 * 
 * Critical for government-grade systems requiring audit compliance.
 */

const { config } = require('dotenv');

// Load environment variables first
config();

const User = require('../models/User.js');
const { createAuditLog } = require('../utils/auditLogger.js');

/**
 * Validates that required environment variables are present
 * @returns {Object} Validation result with status and missing variables
 */
const validateEnvironmentVariables = () => {
  const requiredVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName].trim() === '') {
      missingVars.push(varName);
    }
  });
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
    message: missingVars.length > 0 
      ? `Missing required environment variables: ${missingVars.join(', ')}`
      : 'All required environment variables are present'
  };
};

/**
 * Checks if a Super Admin already exists in the system
 * @returns {Promise<User|null>} Existing Super Admin or null
 */
const checkExistingSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    return existingSuperAdmin;
  } catch (error) {
    console.error('Error checking for existing Super Admin:', error);
    throw new Error('Failed to check for existing Super Admin');
  }
};

/**
 * Creates a new Super Admin user with environment variables
 * @param {string} email - Admin email from environment
 * @param {string} password - Admin password from environment
 * @returns {Promise<User>} Created Super Admin user
 */
const createSuperAdmin = async (email, password) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format for Super Admin');
    }
    
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Super Admin password must be at least 8 characters long');
    }
    
    // Create Super Admin user
    const superAdmin = new User({
      role: 'SUPER_ADMIN',
      adminEmail: email.toLowerCase().trim(),
      adminName: 'System Super Administrator',
      password: password, // Will be hashed by pre-save middleware
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await superAdmin.save();
    
    console.log('✅ Super Admin created successfully');
    console.log(`📧 Email: ${email}`);
    console.log('🔐 Password: [HIDDEN FOR SECURITY]');
    
    return superAdmin;
  } catch (error) {
    console.error('Error creating Super Admin:', error);
    throw new Error(`Failed to create Super Admin: ${error.message}`);
  }
};

/**
 * Logs the Super Admin bootstrap operation for audit purposes
 * @param {User} superAdmin - The created Super Admin user
 * @param {string} operation - The operation performed (created/exists)
 */
const logBootstrapOperation = async (superAdmin, operation) => {
  try {
    await createAuditLog({
      action: 'SUPER_ADMIN_BOOTSTRAP',
      user: superAdmin,
      entityType: 'USER',
      entityId: superAdmin._id,
      details: {
        operation: operation,
        bootstrapTime: new Date(),
        adminEmail: superAdmin.adminEmail,
        systemStartup: true
      }
    });
  } catch (error) {
    // Don't fail bootstrap if audit logging fails
    console.warn('Warning: Failed to log Super Admin bootstrap operation:', error.message);
  }
};

/**
 * Main bootstrap function - initializes Super Admin system
 * Called during server startup
 * @returns {Promise<Object>} Bootstrap result with status and details
 */
const initializeSystem = async () => {
  try {
    console.log('🚀 Initializing SUVIDHA 2026 Government System...');
    
    // Step 1: Validate environment variables
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.isValid) {
      const error = new Error(envValidation.message);
      error.code = 'MISSING_ENV_VARS';
      error.missingVars = envValidation.missingVars;
      throw error;
    }
    
    console.log('✅ Environment variables validated');
    
    // Step 2: Check for existing Super Admin
    const existingSuperAdmin = await checkExistingSuperAdmin();
    
    if (existingSuperAdmin) {
      console.log('ℹ️  Super Admin already exists in the system');
      console.log(`📧 Email: ${existingSuperAdmin.adminEmail}`);
      
      // Log that Super Admin already exists
      await logBootstrapOperation(existingSuperAdmin, 'exists');
      
      return {
        success: true,
        operation: 'exists',
        superAdmin: {
          id: existingSuperAdmin._id,
          email: existingSuperAdmin.adminEmail,
          name: existingSuperAdmin.adminName
        },
        message: 'Super Admin already exists'
      };
    }
    
    // Step 3: Create new Super Admin
    console.log('🔧 Creating Super Admin...');
    const superAdmin = await createSuperAdmin(
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD
    );
    
    // Step 4: Log the bootstrap operation
    await logBootstrapOperation(superAdmin, 'created');
    
    console.log('🎉 SUVIDHA 2026 Government System initialized successfully!');
    console.log('🔐 Super Admin has exclusive authority to:');
    console.log('   • Create departments and sub-departments');
    console.log('   • Create and manage officers');
    console.log('   • Transfer officers between departments');
    console.log('   • Retire officers from the system');
    
    return {
      success: true,
      operation: 'created',
      superAdmin: {
        id: superAdmin._id,
        email: superAdmin.adminEmail,
        name: superAdmin.adminName
      },
      message: 'Super Admin created successfully'
    };
    
  } catch (error) {
    console.error('❌ Failed to initialize SUVIDHA 2026 Government System');
    console.error('Error:', error.message);
    
    if (error.code === 'MISSING_ENV_VARS') {
      console.error('');
      console.error('Required environment variables:');
      error.missingVars.forEach(varName => {
        console.error(`  • ${varName}`);
      });
      console.error('');
      console.error('Please set these variables in your .env file:');
      console.error('ADMIN_EMAIL=admin@suvidha.gov.in');
      console.error('ADMIN_PASSWORD=YourSecurePassword123!');
    }
    
    throw error;
  }
};

module.exports = {
  initializeSystem,
  validateEnvironmentVariables,
  checkExistingSuperAdmin,
  createSuperAdmin
};