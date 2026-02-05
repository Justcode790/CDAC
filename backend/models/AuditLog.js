/**
 * SUVIDHA 2026 - Audit Log Model
 * 
 * This schema tracks all critical system activities for audit purposes.
 * Records actions like:
 * - User logins/logouts
 * - Complaint status changes
 * - Department/Sub-department creation/modification
 * - Officer assignments
 * - Admin actions
 * 
 * Essential for government compliance and security auditing.
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_REGISTER',
      'COMPLAINT_CREATE',
      'COMPLAINT_UPDATE',
      'COMPLAINT_STATUS_CHANGE',
      'COMPLAINT_ASSIGN',
      'DEPARTMENT_CREATE',
      'DEPARTMENT_UPDATE',
      'DEPARTMENT_DELETE',
      'SUBDEPARTMENT_CREATE',
      'SUBDEPARTMENT_UPDATE',
      'SUBDEPARTMENT_DELETE',
      'OFFICER_CREATE',
      'OFFICER_UPDATE',
      'OFFICER_ASSIGN',
      'OFFICER_DEACTIVATE',
      'OFFICER_TRANSFER',
      'OFFICER_RETIRE',
      'SUPER_ADMIN_BOOTSTRAP',
      'SUPER_ADMIN_ACCESS',
      'UNAUTHORIZED_ADMIN_ACCESS',
      'ADMIN_AUTH_ERROR',
      'OPERATION_ACCESS_DENIED',
      'OPERATION_ACCESS_GRANTED',
      'SUPER_ADMIN_OPERATION',
      'OFFICER_ACCESS_ATTEMPT',
      'OFFICER_UNAUTHORIZED_COMPLAINT_ACCESS',
      'OFFICER_COMPLAINT_ACCESS',
      'OFFICER_COMPLAINT_LIST_ACCESS',
      'OFFICER_UNAUTHORIZED_ACTION_ATTEMPT',
      'OFFICER_ACTION_AUTHORIZED',
      'DEMO_DATA_SEED',
      'ADMIN_ACTION',
      'FILE_UPLOAD',
      'FILE_DELETE'
    ],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow null for public actions like OTP initiation
    default: null,
    index: true
  },
  userRole: {
    type: String,
    enum: ['PUBLIC', 'OFFICER', 'ADMIN', 'SUPER_ADMIN'],
    required: true,
    index: true
  },
  entityType: {
    type: String,
    enum: ['USER', 'COMPLAINT', 'DEPARTMENT', 'SUBDEPARTMENT', 'AUDIT_LOG', 'FILE', 'SYSTEM'],
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Flexible schema for different action details
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false, // We use custom timestamp field
  collection: 'auditlogs'
});

// Indexes for efficient querying
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ timestamp: -1 }); // For time-based queries
auditLogSchema.index({ userRole: 1, timestamp: -1 });

// TTL index to auto-delete logs older than 2 years (optional, can be configured)
// auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
