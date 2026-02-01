/**
 * SUVIDHA 2026 - Enhanced Officer Access Control Middleware
 * 
 * This middleware ensures officers can only access complaints assigned to their
 * current sub-department. Handles officer transfers by immediately updating
 * access permissions and preventing access to previous department complaints.
 * 
 * Critical security middleware for role-based data access with transfer support.
 */

const Complaint = require('../models/Complaint.js');
const User = require('../models/User.js');
const { createAuditLog } = require('../utils/auditLogger.js');

/**
 * Middleware to refresh officer assignment data from database
 * Ensures we have the most current assignment after transfers
 */
const refreshOfficerAssignment = async (req, res, next) => {
  try {
    if (req.user.role !== 'OFFICER') {
      return next(); // Skip for non-officers
    }

    // Refresh officer data from database to get current assignment
    const currentOfficer = await User.findById(req.user._id)
      .populate('assignedDepartment', 'name code')
      .populate('assignedSubDepartment', 'name code');

    if (!currentOfficer || !currentOfficer.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Officer account not found or inactive',
        code: 'OFFICER_INACTIVE'
      });
    }

    // Update req.user with current assignment data
    req.user.assignedDepartment = currentOfficer.assignedDepartment;
    req.user.assignedSubDepartment = currentOfficer.assignedSubDepartment;
    req.user.isActive = currentOfficer.isActive;

    // Log access attempt for audit
    await createAuditLog({
      action: 'OFFICER_ACCESS_ATTEMPT',
      user: req.user,
      entityType: 'SYSTEM',
      entityId: null,
      details: {
        endpoint: req.originalUrl,
        method: req.method,
        currentDepartment: currentOfficer.assignedDepartment?.name,
        currentSubDepartment: currentOfficer.assignedSubDepartment?.name,
        timestamp: new Date()
      },
      req
    });

    next();
  } catch (error) {
    console.error('Officer assignment refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error refreshing officer assignment'
    });
  }
};

/**
 * Enhanced middleware to check if officer can access a specific complaint
 * Officers can only access complaints from their CURRENT assigned sub-department
 */
const checkOfficerComplaintAccess = async (req, res, next) => {
  try {
    // Only apply to OFFICER role
    if (req.user.role !== 'OFFICER') {
      return next(); // Skip for non-officers
    }

    const complaintId = req.params.id || req.body.complaintId || req.query.complaintId;

    if (!complaintId) {
      return next(); // No complaint ID, skip check
    }

    // Find complaint with populated department info
    const complaint = await Complaint.findById(complaintId)
      .populate('department', 'name code')
      .populate('subDepartment', 'name code');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if complaint belongs to officer's CURRENT sub-department
    if (!req.user.assignedSubDepartment || 
        complaint.subDepartment._id.toString() !== req.user.assignedSubDepartment._id.toString()) {
      
      // Log unauthorized access attempt
      await createAuditLog({
        action: 'OFFICER_UNAUTHORIZED_COMPLAINT_ACCESS',
        user: req.user,
        entityType: 'COMPLAINT',
        entityId: complaint._id,
        details: {
          complaintNumber: complaint.complaintNumber,
          complaintSubDepartment: complaint.subDepartment.name,
          officerSubDepartment: req.user.assignedSubDepartment?.name,
          accessDeniedReason: 'Complaint not in officer current sub-department',
          timestamp: new Date()
        },
        req
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. This complaint is not assigned to your current sub-department',
        details: {
          complaintDepartment: complaint.department.name,
          complaintSubDepartment: complaint.subDepartment.name,
          yourCurrentSubDepartment: req.user.assignedSubDepartment?.name || 'None'
        }
      });
    }

    // Log successful complaint access
    await createAuditLog({
      action: 'OFFICER_COMPLAINT_ACCESS',
      user: req.user,
      entityType: 'COMPLAINT',
      entityId: complaint._id,
      details: {
        complaintNumber: complaint.complaintNumber,
        accessType: 'VIEW',
        timestamp: new Date()
      },
      req
    });

    // Attach complaint to request for use in controllers
    req.complaint = complaint;
    next();
  } catch (error) {
    console.error('Officer complaint access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking officer complaint access'
    });
  }
};

/**
 * Enhanced middleware to filter complaints by officer's CURRENT sub-department
 * Used in list/query endpoints with immediate transfer support
 */
const filterByOfficerSubDepartment = async (req, res, next) => {
  try {
    // Only apply to OFFICER role
    if (req.user.role !== 'OFFICER') {
      return next(); // Skip for non-officers
    }

    // Ensure officer has current assignment
    if (!req.user.assignedSubDepartment) {
      return res.status(403).json({
        success: false,
        message: 'Officer not assigned to any sub-department',
        code: 'NO_ASSIGNMENT'
      });
    }

    // Force filter to officer's CURRENT sub-department only
    req.query.subDepartment = req.user.assignedSubDepartment._id.toString();
    req.query.department = req.user.assignedDepartment._id.toString();

    // Remove any other department/sub-department filters that might have been set
    delete req.query.allDepartments;
    delete req.query.previousAssignments;

    // Log complaint list access
    await createAuditLog({
      action: 'OFFICER_COMPLAINT_LIST_ACCESS',
      user: req.user,
      entityType: 'COMPLAINT',
      entityId: null,
      details: {
        filteredDepartment: req.user.assignedDepartment.name,
        filteredSubDepartment: req.user.assignedSubDepartment.name,
        queryParams: req.query,
        timestamp: new Date()
      },
      req
    });

    next();
  } catch (error) {
    console.error('Officer complaint filter error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error filtering complaints by officer assignment'
    });
  }
};

/**
 * Middleware to enforce database-level access control for officer queries
 * Adds MongoDB query constraints to prevent data leakage
 */
const enforceOfficerQueryConstraints = async (req, res, next) => {
  try {
    if (req.user.role !== 'OFFICER') {
      return next(); // Skip for non-officers
    }

    // Create database query constraints for officer access
    const officerConstraints = {
      department: req.user.assignedDepartment._id,
      subDepartment: req.user.assignedSubDepartment._id
    };

    // Attach constraints to request for use in controllers
    req.officerConstraints = officerConstraints;

    // Store original query method to add constraints
    req.addOfficerConstraints = (query) => {
      return {
        ...query,
        ...officerConstraints
      };
    };

    next();
  } catch (error) {
    console.error('Officer query constraints error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error enforcing officer query constraints'
    });
  }
};

/**
 * Middleware to validate officer can perform specific actions on complaints
 * @param {string} action - Action type (VIEW, UPDATE, ASSIGN, etc.)
 */
const validateOfficerComplaintAction = (action) => {
  return async (req, res, next) => {
    try {
      if (req.user.role !== 'OFFICER') {
        return next(); // Skip for non-officers
      }

      const complaintId = req.params.id;
      if (!complaintId) {
        return res.status(400).json({
          success: false,
          message: 'Complaint ID required for this action'
        });
      }

      // Get complaint and verify access
      const complaint = await Complaint.findById(complaintId)
        .populate('subDepartment', 'name code');

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      // Verify complaint belongs to officer's current sub-department
      if (complaint.subDepartment._id.toString() !== req.user.assignedSubDepartment._id.toString()) {
        await createAuditLog({
          action: 'OFFICER_UNAUTHORIZED_ACTION_ATTEMPT',
          user: req.user,
          entityType: 'COMPLAINT',
          entityId: complaint._id,
          details: {
            attemptedAction: action,
            complaintNumber: complaint.complaintNumber,
            complaintSubDepartment: complaint.subDepartment.name,
            officerSubDepartment: req.user.assignedSubDepartment.name,
            timestamp: new Date()
          },
          req
        });

        return res.status(403).json({
          success: false,
          message: `Access denied. Cannot ${action.toLowerCase()} complaint from different sub-department`,
          details: {
            action: action,
            complaintSubDepartment: complaint.subDepartment.name,
            yourSubDepartment: req.user.assignedSubDepartment.name
          }
        });
      }

      // Log successful action authorization
      await createAuditLog({
        action: 'OFFICER_ACTION_AUTHORIZED',
        user: req.user,
        entityType: 'COMPLAINT',
        entityId: complaint._id,
        details: {
          authorizedAction: action,
          complaintNumber: complaint.complaintNumber,
          timestamp: new Date()
        },
        req
      });

      req.complaint = complaint;
      req.authorizedAction = action;
      next();

    } catch (error) {
      console.error(`Officer action validation error for ${action}:`, error);
      return res.status(500).json({
        success: false,
        message: `Error validating officer ${action.toLowerCase()} permission`
      });
    }
  };
};

module.exports = {
  refreshOfficerAssignment,
  checkOfficerComplaintAccess,
  filterByOfficerSubDepartment,
  enforceOfficerQueryConstraints,
  validateOfficerComplaintAction
};
