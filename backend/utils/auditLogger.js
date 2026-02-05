/**
 * SUVIDHA 2026 - Audit Logger Utility
 * 
 * This module provides functions to log system activities for audit purposes.
 * All critical actions are logged with user information, timestamps, and details.
 * 
 * Essential for government compliance and security auditing.
 */

const AuditLog = require('../models/AuditLog.js');

/**
 * Create an audit log entry
 * @param {Object} logData - Audit log data
 * @param {String} logData.action - Action type (from enum)
 * @param {Object} logData.user - User object
 * @param {String} logData.entityType - Type of entity affected
 * @param {String} logData.entityId - ID of entity affected
 * @param {Object} logData.details - Additional details
 * @param {Object} logData.req - Express request object (for IP and user agent)
 */
const createAuditLog = async (logData) => {
  try {
    const {
      action,
      user,
      entityType,
      entityId,
      details = {},
      req = null
    } = logData;

    // Validate required fields
    if (!action) {
      console.error('Audit log: Missing action');
      return;
    }

    const auditLog = new AuditLog({
      action,
      user: user?._id || user || null,
      userRole: user?.role || 'PUBLIC',
      entityType,
      entityId,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.get('user-agent') || null,
      timestamp: new Date()
    });

    await auditLog.save();
    
    // Don't throw errors for audit logging failures (non-critical)
    // Just log to console
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit logging should not break the main flow
  }
};

/**
 * Log user login
 */
const logUserLogin = async (user, req) => {
  await createAuditLog({
    action: 'USER_LOGIN',
    user,
    entityType: 'USER',
    entityId: user._id,
    details: {
      loginMethod: user.role === 'PUBLIC' ? 'OTP' : 'PASSWORD',
      timestamp: new Date()
    },
    req
  });
};

/**
 * Log user logout
 */
const logUserLogout = async (user, req) => {
  await createAuditLog({
    action: 'USER_LOGOUT',
    user,
    entityType: 'USER',
    entityId: user._id,
    req
  });
};

/**
 * Log complaint creation
 */
const logComplaintCreate = async (user, complaint, req) => {
  await createAuditLog({
    action: 'COMPLAINT_CREATE',
    user,
    entityType: 'COMPLAINT',
    entityId: complaint._id,
    details: {
      complaintNumber: complaint.complaintNumber,
      category: complaint.category,
      priority: complaint.priority
    },
    req
  });
};

/**
 * Log complaint status change
 */
const logComplaintStatusChange = async (user, complaint, oldStatus, newStatus, req) => {
  await createAuditLog({
    action: 'COMPLAINT_STATUS_CHANGE',
    user,
    entityType: 'COMPLAINT',
    entityId: complaint._id,
    details: {
      complaintNumber: complaint.complaintNumber,
      oldStatus,
      newStatus
    },
    req
  });
};

module.exports = {
  createAuditLog,
  logUserLogin,
  logUserLogout,
  logComplaintCreate,
  logComplaintStatusChange
};
