/**
 * SUVIDHA 2026 - Data Integrity Engine
 * 
 * This service enforces government-grade data integrity rules and constraints.
 * It ensures business rule compliance across all administrative operations.
 * 
 * Critical for maintaining data consistency and preventing invalid system states.
 */

const User = require('../models/User.js');
const Department = require('../models/Department.js');
const SubDepartment = require('../models/SubDepartment.js');
const Complaint = require('../models/Complaint.js');
const mongoose = require('mongoose');

/**
 * Custom error class for data integrity violations
 */
class DataIntegrityError extends Error {
  constructor(constraint, entity, details = {}) {
    super(`Data integrity violation: ${constraint} for ${entity}`);
    this.name = 'DataIntegrityError';
    this.constraint = constraint;
    this.entity = entity;
    this.details = details;
    this.code = 'DATA_INTEGRITY_VIOLATION';
  }
}

/**
 * Validates that an officer belongs to only one department
 * @param {string} officerId - Officer's MongoDB ID
 * @param {string} departmentId - Department ID to assign
 * @param {string} subDepartmentId - Sub-department ID to assign
 * @returns {Promise<Object>} Validation result
 */
const validateOfficerAssignment = async (officerId, departmentId, subDepartmentId) => {
  try {
    // Check if officer exists and is active
    const officer = await User.findById(officerId);
    if (!officer || officer.role !== 'OFFICER') {
      return {
        isValid: false,
        violations: ['Officer not found or invalid role'],
        details: { officerId, role: officer?.role }
      };
    }
    
    if (!officer.isActive) {
      return {
        isValid: false,
        violations: ['Officer is not active'],
        details: { officerId, isActive: officer.isActive }
      };
    }
    
    // Validate department exists
    const department = await Department.findById(departmentId);
    if (!department || !department.isActive) {
      return {
        isValid: false,
        violations: ['Department not found or inactive'],
        details: { departmentId }
      };
    }
    
    // Validate sub-department exists and belongs to the department
    const subDepartment = await SubDepartment.findById(subDepartmentId);
    if (!subDepartment || !subDepartment.isActive) {
      return {
        isValid: false,
        violations: ['Sub-department not found or inactive'],
        details: { subDepartmentId }
      };
    }
    
    if (subDepartment.department.toString() !== departmentId.toString()) {
      return {
        isValid: false,
        violations: ['Sub-department does not belong to the specified department'],
        details: { 
          subDepartmentId, 
          subDeptDepartment: subDepartment.department,
          requestedDepartment: departmentId 
        }
      };
    }
    
    return {
      isValid: true,
      violations: [],
      details: {
        officer: officer.officerName,
        department: department.name,
        subDepartment: subDepartment.name
      }
    };
    
  } catch (error) {
    console.error('Error validating officer assignment:', error);
    return {
      isValid: false,
      violations: ['System error during validation'],
      details: { error: error.message }
    };
  }
};

/**
 * Enforces that an officer can only be assigned to one department at a time
 * @param {string} officerId - Officer's MongoDB ID
 * @returns {Promise<boolean>} True if officer has unique assignment
 */
const enforceUniqueAssignment = async (officerId) => {
  try {
    const officer = await User.findById(officerId);
    if (!officer || officer.role !== 'OFFICER') {
      throw new DataIntegrityError(
        'INVALID_OFFICER',
        'Officer',
        { officerId, message: 'Officer not found or invalid role' }
      );
    }
    
    // Check if officer is already assigned to a department
    if (officer.assignedDepartment && officer.assignedSubDepartment) {
      // This is valid - officer has exactly one assignment
      return true;
    }
    
    // Check for partial assignments (should not happen with proper validation)
    if (officer.assignedDepartment && !officer.assignedSubDepartment) {
      throw new DataIntegrityError(
        'INCOMPLETE_ASSIGNMENT',
        'Officer',
        { officerId, message: 'Officer has department but no sub-department' }
      );
    }
    
    if (!officer.assignedDepartment && officer.assignedSubDepartment) {
      throw new DataIntegrityError(
        'INCOMPLETE_ASSIGNMENT',
        'Officer',
        { officerId, message: 'Officer has sub-department but no department' }
      );
    }
    
    return true;
  } catch (error) {
    if (error instanceof DataIntegrityError) {
      throw error;
    }
    throw new DataIntegrityError(
      'VALIDATION_ERROR',
      'Officer',
      { officerId, error: error.message }
    );
  }
};

/**
 * Validates constraints for officer transfer operations
 * @param {Object} transferData - Transfer operation data
 * @returns {Promise<Object>} Validation result
 */
const validateTransferConstraints = async (transferData) => {
  const { officerId, fromDepartment, fromSubDepartment, toDepartment, toSubDepartment, transferredBy } = transferData;
  
  try {
    const violations = [];
    
    // Validate officer exists and current assignment matches 'from' data
    const officer = await User.findById(officerId);
    if (!officer || officer.role !== 'OFFICER') {
      violations.push('Officer not found or invalid role');
    } else {
      // Verify current assignment matches 'from' data
      if (officer.assignedDepartment?.toString() !== fromDepartment?.toString()) {
        violations.push('Officer current department does not match transfer source');
      }
      
      if (officer.assignedSubDepartment?.toString() !== fromSubDepartment?.toString()) {
        violations.push('Officer current sub-department does not match transfer source');
      }
    }
    
    // Validate destination assignment
    const destinationValidation = await validateOfficerAssignment(officerId, toDepartment, toSubDepartment);
    if (!destinationValidation.isValid) {
      violations.push(...destinationValidation.violations);
    }
    
    // Validate transferring authority
    const transferringUser = await User.findById(transferredBy);
    if (!transferringUser || transferringUser.role !== 'SUPER_ADMIN') {
      violations.push('Only Super Admin can transfer officers');
    }
    
    // Validate not transferring to same department/sub-department
    if (fromDepartment?.toString() === toDepartment?.toString() && 
        fromSubDepartment?.toString() === toSubDepartment?.toString()) {
      violations.push('Cannot transfer officer to the same department and sub-department');
    }
    
    return {
      isValid: violations.length === 0,
      violations,
      details: {
        officer: officer?.officerName,
        from: destinationValidation.details,
        transferredBy: transferringUser?.adminName
      }
    };
    
  } catch (error) {
    console.error('Error validating transfer constraints:', error);
    return {
      isValid: false,
      violations: ['System error during transfer validation'],
      details: { error: error.message }
    };
  }
};

/**
 * Cleans up orphaned records and maintains referential integrity
 * @returns {Promise<Object>} Cleanup result
 */
const cleanupOrphanedRecords = async () => {
  const session = await mongoose.startSession();
  
  try {
    const cleanupResult = {
      orphanedSubDepartments: 0,
      invalidOfficerAssignments: 0,
      orphanedComplaints: 0,
      errors: []
    };
    
    await session.withTransaction(async () => {
      // Find and handle orphaned sub-departments (department doesn't exist)
      const orphanedSubDepts = await SubDepartment.find({
        department: { $nin: await Department.find({ isActive: true }).distinct('_id') }
      }).session(session);
      
      for (const subDept of orphanedSubDepts) {
        // Deactivate orphaned sub-departments instead of deleting (for audit)
        await SubDepartment.findByIdAndUpdate(
          subDept._id,
          { isActive: false, orphanedAt: new Date() },
          { session }
        );
        cleanupResult.orphanedSubDepartments++;
      }
      
      // Find officers with invalid assignments
      const invalidOfficers = await User.find({
        role: 'OFFICER',
        $or: [
          { assignedDepartment: { $exists: true }, assignedSubDepartment: { $exists: false } },
          { assignedDepartment: { $exists: false }, assignedSubDepartment: { $exists: true } }
        ]
      }).session(session);
      
      for (const officer of invalidOfficers) {
        // Clear invalid assignments
        await User.findByIdAndUpdate(
          officer._id,
          { 
            $unset: { assignedDepartment: 1, assignedSubDepartment: 1 },
            isActive: false,
            invalidAssignmentCleanedAt: new Date()
          },
          { session }
        );
        cleanupResult.invalidOfficerAssignments++;
      }
      
      // Handle complaints with invalid officer assignments (optional - for data consistency)
      const invalidComplaints = await Complaint.find({
        assignedOfficer: { $nin: await User.find({ role: 'OFFICER', isActive: true }).distinct('_id') }
      }).session(session);
      
      for (const complaint of invalidComplaints) {
        // Unassign complaints from invalid officers
        await Complaint.findByIdAndUpdate(
          complaint._id,
          { $unset: { assignedOfficer: 1 }, orphanedOfficerCleanedAt: new Date() },
          { session }
        );
        cleanupResult.orphanedComplaints++;
      }
    });
    
    return {
      success: true,
      ...cleanupResult,
      message: 'Orphaned records cleanup completed successfully'
    };
    
  } catch (error) {
    console.error('Error during orphaned records cleanup:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to cleanup orphaned records'
    };
  } finally {
    await session.endSession();
  }
};

/**
 * Performs comprehensive data consistency audit
 * @returns {Promise<Object>} Audit result with findings
 */
const auditDataConsistency = async () => {
  try {
    const auditResult = {
      timestamp: new Date(),
      findings: [],
      statistics: {},
      recommendations: []
    };
    
    // Check for officers without proper assignments
    const officersWithoutAssignment = await User.countDocuments({
      role: 'OFFICER',
      isActive: true,
      $or: [
        { assignedDepartment: { $exists: false } },
        { assignedSubDepartment: { $exists: false } }
      ]
    });
    
    if (officersWithoutAssignment > 0) {
      auditResult.findings.push({
        type: 'INCOMPLETE_OFFICER_ASSIGNMENTS',
        count: officersWithoutAssignment,
        severity: 'HIGH',
        description: 'Active officers without complete department assignments'
      });
      auditResult.recommendations.push('Review and complete officer assignments');
    }
    
    // Check for sub-departments without parent departments
    const orphanedSubDepartments = await SubDepartment.countDocuments({
      isActive: true,
      department: { $nin: await Department.find({ isActive: true }).distinct('_id') }
    });
    
    if (orphanedSubDepartments > 0) {
      auditResult.findings.push({
        type: 'ORPHANED_SUBDEPARTMENTS',
        count: orphanedSubDepartments,
        severity: 'MEDIUM',
        description: 'Sub-departments without valid parent departments'
      });
      auditResult.recommendations.push('Clean up orphaned sub-departments');
    }
    
    // Collect statistics
    auditResult.statistics = {
      totalOfficers: await User.countDocuments({ role: 'OFFICER' }),
      activeOfficers: await User.countDocuments({ role: 'OFFICER', isActive: true }),
      totalDepartments: await Department.countDocuments({ isActive: true }),
      totalSubDepartments: await SubDepartment.countDocuments({ isActive: true }),
      totalComplaints: await Complaint.countDocuments()
    };
    
    return {
      success: true,
      audit: auditResult,
      message: 'Data consistency audit completed successfully'
    };
    
  } catch (error) {
    console.error('Error during data consistency audit:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to perform data consistency audit'
    };
  }
};

module.exports = {
  DataIntegrityError,
  validateOfficerAssignment,
  enforceUniqueAssignment,
  validateTransferConstraints,
  cleanupOrphanedRecords,
  auditDataConsistency
};