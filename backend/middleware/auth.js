/**
 * SUVIDHA 2026 - Authentication Middleware
 * 
 * This middleware handles JWT-based authentication.
 * It verifies JWT tokens and attaches user information to the request object.
 * 
 * Usage:
 * - Protect routes that require authentication
 * - Extract user info from token
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password -otp -otpExpiry');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if officer is active
      if (user.role === 'OFFICER' && !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Officer account is deactivated'
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is citizen
 */
const isCitizen = authorize('PUBLIC');

/**
 * Middleware to check if user is officer
 */
const isOfficer = authorize('OFFICER');

/**
 * Middleware to check if user is admin
 */
const isAdmin = authorize('ADMIN');

module.exports = {
  authenticate,
  authorize,
  isCitizen,
  isOfficer,
  isAdmin
};
