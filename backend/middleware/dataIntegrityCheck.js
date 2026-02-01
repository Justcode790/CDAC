/**
 * SUVIDHA 2026 - Data Integrity Check Middleware
 * 
 * This middleware performs pre-operation validation to ensure data integrity
 * constraints are met before executing administrative operations.
 * 
 * Applied to critical government operations like officer management.
 */

const { 
  validateOfficerAssignment, 
  validateTransferConstraints,
  DataIntegrityError 
} = require('../services/dataIntegrityService.js');

/**
 * Middleware to validate officer creation data integrity
 */
const validateOfficerCreation = async (req, res, next) => {
  try {
    const { assignedDepartment, assignedSubDepartment } = req.body;
    
    if (!assignedDepartment || !assignedSubDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department and sub-department assignments are required for officers',
        violations: ['Missing department or sub-department assignment']
      });
    }
    
    // Validate the assignment is valid (department/sub-department relationship)
    const validation = await validateOfficerAssignment(null, assignedDepartment, assignedSubDepartment);
    
    if (!validation.isValid) {
      return res.status(409).json({
        success: false,
        message: 'Data integrity violation in officer assignment',
        violations: validation.violations,
        details: validation.details
      });
    }
    
    // Attach validation result to request for use in controller
    req.validatedAssignment = validation.details;
    next();
    
  } catch (error) {
    console.error('Officer creation validation error:', error);
    
    if (error instanceof DataIntegrityError) {
      return res.status(409).json({
        success: false,
        message: error.message,
        constraint: error.constraint,
        entity: error.entity,
        details: error.details
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error validating officer creation data',
      error: error.message
    });
  }
};

/**
 * Middleware to validate officer transfer data integrity
 */
const validateOfficerTransfer = async (req, res, next) => {
  try {
    const officerId = req.params.id;
    const { toDepartment, toSubDepartment, reason } = req.body;
    const transferredBy = req.user._id;
    
    if (!toDepartment || !toSubDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Destination department and sub-department are required for transfer',
        violations: ['Missing destination department or sub-department']
      });
    }
    
    // Get current officer assignment for validation
    const User = require('../models/User.js');
    const officer = await User.findById(officerId);
    
    if (!officer || officer.role !== 'OFFICER') {
      return res.status(404).json({
        success: false,
        message: 'Officer not found or invalid role'
      });
    }
    
    const transferData = {
      officerId,
      fromDepartment: officer.assignedDepartment,
      fromSubDepartment: officer.assignedSubDepartment,
      toDepartment,
      toSubDepartment,
      transferredBy,
      reason
    };
    
    // Validate transfer constraints
    const validation = await validateTransferConstraints(transferData);
    
    if (!validation.isValid) {
      return res.status(409).json({
        success: false,
        message: 'Data integrity violation in officer transfer',
        violations: validation.violations,
        details: validation.details
      });
    }
    
    // Attach transfer data to request for use in controller
    req.validatedTransfer = {
      ...transferData,
      validation: validation.details
    };
    
    next();
    
  } catch (error) {
    console.error('Officer transfer validation error:', error);
    
    if (error instanceof DataIntegrityError) {
      return res.status(409).json({
        success: false,
        message: error.message,
        constraint: error.constraint,
        entity: error.entity,
        details: error.details
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error validating officer transfer data',
      error: error.message
    });
  }
};

/**
 * Middleware to validate officer retirement/deletion constraints
 */
const validateOfficerRetirement = async (req, res, next) => {
  try {
    const officerId = req.params.id;
    const retiredBy = req.user._id;
    
    // Validate officer exists and can be retired
    const User = require('../models/User.js');
    const officer = await User.findById(officerId);
    
    if (!officer || officer.role !== 'OFFICER') {
      return res.status(404).json({
        success: false,
        message: 'Officer not found or invalid role'
      });
    }
    
    if (!officer.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Officer is already inactive'
      });
    }
    
    // Check if retiring user has authority (Super Admin only)
    const retiringUser = await User.findById(retiredBy);
    if (!retiringUser || retiringUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can retire officers'
      });
    }
    
    // Attach retirement data to request
    req.retirementData = {
      officer: {
        id: officer._id,
        name: officer.officerName,
        officerId: officer.officerId,
        department: officer.assignedDepartment,
        subDepartment: officer.assignedSubDepartment
      },
      retiredBy: {
        id: retiringUser._id,
        name: retiringUser.adminName,
        email: retiringUser.adminEmail
      }
    };
    
    next();
    
  } catch (error) {
    console.error('Officer retirement validation error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error validating officer retirement',
      error: error.message
    });
  }
};

/**
 * General data integrity enforcement middleware
 * Can be applied to any operation that needs integrity checks
 */
const enforceDataIntegrity = (operationType) => {
  return async (req, res, next) => {
    try {
      switch (operationType) {
        case 'OFFICER_CREATE':
          return validateOfficerCreation(req, res, next);
        case 'OFFICER_TRANSFER':
          return validateOfficerTransfer(req, res, next);
        case 'OFFICER_RETIRE':
          return validateOfficerRetirement(req, res, next);
        default:
          // For unknown operation types, just proceed
          next();
      }
    } catch (error) {
      console.error(`Data integrity enforcement error for ${operationType}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Data integrity enforcement failed',
        operation: operationType,
        error: error.message
      });
    }
  };
};

module.exports = {
  validateOfficerCreation,
  validateOfficerTransfer,
  validateOfficerRetirement,
  enforceDataIntegrity
};