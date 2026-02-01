/**
 * SUVIDHA 2026 - Super Admin Authorization Middleware
 * 
 * This middleware enforces Super Admin-only access for critical government operations.
 * Ensures only the root authority can perform administrative functions like:
 * - Creating departments and sub-departments
 * - Managing officer lifecycle (create, transfer, retire)
 * - System-wide administrative operations
 * 
 * Essential for government-grade security and audit compliance.
 */

const { createAuditLog } = require('../utils/auditLogger.js');

/**
 * Middleware to require Super Admin role for protected operations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireSuperAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated (should be handled by auth middleware first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }
    
    // Check if user has Super Admin role
    if (req.user.role !== 'SUPER_ADMIN') {
      // Log unauthorized access attempt
      await createAuditLog({
        action: 'UNAUTHORIZED_ADMIN_ACCESS',
        user: req.user,
        entityType: 'SYSTEM',
        entityId: null,
        details: {
          attemptedOperation: req.method + ' ' + req.originalUrl,
          userRole: req.user.role,
          requiredRole: 'SUPER_ADMIN',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          timestamp: new Date()
        },
        req
      });
      
      return res.status(403).json({
        success: false,
        message: 'Super Admin access required for this operation',
        code: 'INSUFFICIENT_PRIVILEGES',
        details: {
          requiredRole: 'SUPER_ADMIN',
          currentRole: req.user.role,
          operation: req.originalUrl
        }
      });
    }
    
    // Log successful Super Admin access
    await createAuditLog({
      action: 'SUPER_ADMIN_ACCESS',
      user: req.user,
      entityType: 'SYSTEM',
      entityId: null,
      details: {
        operation: req.method + ' ' + req.originalUrl,
        adminEmail: req.user.adminEmail,
        adminName: req.user.adminName,
        timestamp: new Date()
      },
      req
    });
    
    next();
    
  } catch (error) {
    console.error('Super Admin authorization error:', error);
    
    // Log the authorization error
    try {
      await createAuditLog({
        action: 'ADMIN_AUTH_ERROR',
        user: req.user || null,
        entityType: 'SYSTEM',
        entityId: null,
        details: {
          error: error.message,
          operation: req.originalUrl,
          timestamp: new Date()
        },
        req
      });
    } catch (auditError) {
      console.error('Failed to log authorization error:', auditError);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      code: 'AUTHORIZATION_ERROR'
    });
  }
};

/**
 * Middleware to require Super Admin role with specific operation logging
 * @param {string} operationType - Type of operation being performed
 * @returns {Function} Express middleware function
 */
const requireSuperAdminForOperation = (operationType) => {
  return async (req, res, next) => {
    try {
      // Check authentication
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        });
      }
      
      // Check Super Admin role
      if (req.user.role !== 'SUPER_ADMIN') {
        // Log specific operation access denial
        await createAuditLog({
          action: 'OPERATION_ACCESS_DENIED',
          user: req.user,
          entityType: 'SYSTEM',
          entityId: null,
          details: {
            operationType: operationType,
            attemptedBy: req.user.role,
            requiredRole: 'SUPER_ADMIN',
            endpoint: req.originalUrl,
            method: req.method,
            timestamp: new Date()
          },
          req
        });
        
        return res.status(403).json({
          success: false,
          message: `Super Admin access required for ${operationType}`,
          code: 'INSUFFICIENT_PRIVILEGES',
          details: {
            operation: operationType,
            requiredRole: 'SUPER_ADMIN',
            currentRole: req.user.role
          }
        });
      }
      
      // Log successful operation access
      await createAuditLog({
        action: 'OPERATION_ACCESS_GRANTED',
        user: req.user,
        entityType: 'SYSTEM',
        entityId: null,
        details: {
          operationType: operationType,
          adminEmail: req.user.adminEmail,
          adminName: req.user.adminName,
          endpoint: req.originalUrl,
          method: req.method,
          timestamp: new Date()
        },
        req
      });
      
      // Attach operation type to request for use in controllers
      req.operationType = operationType;
      next();
      
    } catch (error) {
      console.error(`Super Admin authorization error for ${operationType}:`, error);
      
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        code: 'AUTHORIZATION_ERROR',
        operation: operationType
      });
    }
  };
};

/**
 * Middleware to validate Super Admin session and check for account status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateSuperAdminSession = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Super Admin session required',
        code: 'INVALID_ADMIN_SESSION'
      });
    }
    
    // Additional Super Admin specific validations can be added here
    // For example: check if Super Admin account is still active, not locked, etc.
    
    // Check if this is the bootstrap Super Admin (additional security)
    const User = require('../models/User.js');
    const superAdmin = await User.findById(req.user._id);
    
    if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Super Admin account not found or invalid',
        code: 'INVALID_ADMIN_ACCOUNT'
      });
    }
    
    // Update last activity timestamp
    superAdmin.lastLogin = new Date();
    await superAdmin.save();
    
    next();
    
  } catch (error) {
    console.error('Super Admin session validation error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Session validation failed',
      code: 'SESSION_VALIDATION_ERROR'
    });
  }
};

/**
 * Middleware to log all Super Admin operations for audit compliance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const logSuperAdminOperation = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
      // Store original res.json to intercept response
      const originalJson = res.json;
      
      res.json = function(data) {
        // Log the operation result
        createAuditLog({
          action: 'SUPER_ADMIN_OPERATION',
          user: req.user,
          entityType: 'SYSTEM',
          entityId: null,
          details: {
            method: req.method,
            endpoint: req.originalUrl,
            operationType: req.operationType || 'UNKNOWN',
            requestBody: req.method !== 'GET' ? req.body : undefined,
            responseStatus: res.statusCode,
            success: data?.success || false,
            timestamp: new Date()
          },
          req
        }).catch(error => {
          console.error('Failed to log Super Admin operation:', error);
        });
        
        // Call original json method
        return originalJson.call(this, data);
      };
    }
    
    next();
    
  } catch (error) {
    console.error('Super Admin operation logging error:', error);
    next(); // Don't block the request if logging fails
  }
};

module.exports = {
  requireSuperAdmin,
  requireSuperAdminForOperation,
  validateSuperAdminSession,
  logSuperAdminOperation
};