/**
 * SUVIDHA 2026 - JWT Utility Functions
 * 
 * This module provides functions to generate and verify JWT tokens.
 * Used for user authentication across the application.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user
 * @param {Object} user - User object with _id and role
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    ...(user.role === 'OFFICER' && { 
      officerId: user.officerId,
      subDepartment: user.assignedSubDepartment 
    })
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Decode JWT token without verification (for inspection only)
 * @param {String} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
