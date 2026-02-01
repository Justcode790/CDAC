/**
 * SUVIDHA 2026 - Administrative Routes
 * 
 * These routes handle Super Admin-only operations for government system management.
 * All routes require Super Admin authorization and include comprehensive audit logging.
 * 
 * Protected endpoints for:
 * - Department and sub-department management
 * - Officer lifecycle operations (create, transfer, retire)
 * - System administrative functions
 */

const express = require('express');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/auth.js');
const { 
  requireSuperAdmin, 
  requireSuperAdminForOperation,
  validateSuperAdminSession,
  logSuperAdminOperation 
} = require('../middleware/superAdminAuth.js');
const { 
  validateOfficerCreation,
  validateOfficerTransfer,
  validateOfficerRetirement,
  enforceDataIntegrity 
} = require('../middleware/dataIntegrityCheck.js');

// Import controllers
const {
  createDepartment,
  createSubDepartment,
  createOfficerAccount,
  transferOfficerToDepartment,
  retireOfficerFromSystem,
  getAllDepartments,
  getAllSubDepartments,
  getAllOfficers
} = require('../controllers/adminController.js');

// Apply authentication and Super Admin validation to all routes
router.use(authenticate); // JWT authentication
router.use(validateSuperAdminSession); // Super Admin session validation
router.use(logSuperAdminOperation); // Audit logging

// Department Management Routes
/**
 * @route   POST /api/admin/departments
 * @desc    Create a new government department
 * @access  Super Admin only
 */
router.post('/departments', 
  requireSuperAdminForOperation('DEPARTMENT_CREATE'),
  createDepartment
);

/**
 * @route   GET /api/admin/departments
 * @desc    Get all departments with statistics
 * @access  Super Admin only
 */
router.get('/departments',
  requireSuperAdmin,
  getAllDepartments
);

// Sub-Department Management Routes
/**
 * @route   POST /api/admin/subdepartments
 * @desc    Create a new sub-department within a department
 * @access  Super Admin only
 */
router.post('/subdepartments',
  requireSuperAdminForOperation('SUBDEPARTMENT_CREATE'),
  createSubDepartment
);

/**
 * @route   GET /api/admin/subdepartments
 * @desc    Get all sub-departments with department info
 * @access  Super Admin only
 * @query   department - Filter by department ID (optional)
 */
router.get('/subdepartments',
  requireSuperAdmin,
  getAllSubDepartments
);

// Officer Management Routes
/**
 * @route   POST /api/admin/officers
 * @desc    Create a new officer with auto-generated credentials
 * @access  Super Admin only
 */
router.post('/officers',
  requireSuperAdminForOperation('OFFICER_CREATE'),
  enforceDataIntegrity('OFFICER_CREATE'),
  createOfficerAccount
);

/**
 * @route   GET /api/admin/officers
 * @desc    Get all officers with department assignments
 * @access  Super Admin only
 * @query   department - Filter by department ID (optional)
 * @query   subDepartment - Filter by sub-department ID (optional)
 * @query   isActive - Filter by active status (optional)
 */
router.get('/officers',
  requireSuperAdmin,
  getAllOfficers
);

/**
 * @route   PUT /api/admin/officers/:id/transfer
 * @desc    Transfer officer to new department/sub-department
 * @access  Super Admin only
 */
router.put('/officers/:id/transfer',
  requireSuperAdminForOperation('OFFICER_TRANSFER'),
  enforceDataIntegrity('OFFICER_TRANSFER'),
  transferOfficerToDepartment
);

/**
 * @route   DELETE /api/admin/officers/:id
 * @desc    Retire officer from the system (hard delete)
 * @access  Super Admin only
 */
router.delete('/officers/:id',
  requireSuperAdminForOperation('OFFICER_RETIRE'),
  enforceDataIntegrity('OFFICER_RETIRE'),
  retireOfficerFromSystem
);

// System Information Routes
/**
 * @route   GET /api/admin/system/status
 * @desc    Get system status and statistics
 * @access  Super Admin only
 */
router.get('/system/status', requireSuperAdmin, async (req, res) => {
  try {
    const User = require('../models/User.js');
    const Department = require('../models/Department.js');
    const SubDepartment = require('../models/SubDepartment.js');
    const Complaint = require('../models/Complaint.js');
    
    const systemStats = {
      timestamp: new Date(),
      superAdmin: {
        id: req.user._id,
        email: req.user.adminEmail,
        name: req.user.adminName,
        lastLogin: req.user.lastLogin
      },
      statistics: {
        departments: await Department.countDocuments({ isActive: true }),
        subDepartments: await SubDepartment.countDocuments({ isActive: true }),
        officers: {
          total: await User.countDocuments({ role: 'OFFICER' }),
          active: await User.countDocuments({ role: 'OFFICER', isActive: true }),
          inactive: await User.countDocuments({ role: 'OFFICER', isActive: false })
        },
        citizens: await User.countDocuments({ role: 'PUBLIC' }),
        complaints: {
          total: await Complaint.countDocuments(),
          pending: await Complaint.countDocuments({ status: 'PENDING' }),
          inProgress: await Complaint.countDocuments({ status: 'IN_PROGRESS' }),
          resolved: await Complaint.countDocuments({ status: 'RESOLVED' })
        }
      }
    };
    
    res.json({
      success: true,
      system: systemStats
    });
    
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/audit/recent
 * @desc    Get recent audit logs for Super Admin review
 * @access  Super Admin only
 */
router.get('/audit/recent', requireSuperAdmin, async (req, res) => {
  try {
    const { limit = 50, action, entityType } = req.query;
    
    const AuditLog = require('../models/AuditLog.js');
    
    const filter = {};
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    
    const auditLogs = await AuditLog.find(filter)
      .populate('user', 'role adminName officerName name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: auditLogs.length,
      auditLogs: auditLogs.map(log => ({
        id: log._id,
        action: log.action,
        user: {
          id: log.user?._id,
          role: log.user?.role,
          name: log.user?.adminName || log.user?.officerName || log.user?.name
        },
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.details,
        ipAddress: log.ipAddress,
        timestamp: log.timestamp
      }))
    });
    
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/system/integrity-check
 * @desc    Run data integrity audit and cleanup
 * @access  Super Admin only
 */
router.post('/system/integrity-check', 
  requireSuperAdminForOperation('SYSTEM_INTEGRITY_CHECK'),
  async (req, res) => {
    try {
      const { 
        auditDataConsistency, 
        cleanupOrphanedRecords 
      } = require('../services/dataIntegrityService.js');
      
      // Run data consistency audit
      const auditResult = await auditDataConsistency();
      
      // Optionally run cleanup if requested
      let cleanupResult = null;
      if (req.body.runCleanup === true) {
        cleanupResult = await cleanupOrphanedRecords();
      }
      
      res.json({
        success: true,
        message: 'Data integrity check completed',
        audit: auditResult,
        cleanup: cleanupResult,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Error running integrity check:', error);
      res.status(500).json({
        success: false,
        message: 'Error running data integrity check',
        error: error.message
      });
    }
  }
);

module.exports = router;